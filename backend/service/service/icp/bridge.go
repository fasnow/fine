package icp

import (
	"context"
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/models"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/service/model/icp"
	"fine/backend/utils"
	"fmt"
	"github.com/cenkalti/backoff/v4"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
)

type Bridge struct {
	app         *app.App
	icp         *ICP
	queryLog    *service.ICPQueryLog
	downloadLog *service.DownloadLogService
	proxy       string
	dataCache   *service.IcpDBService
}

func NewICPBridge(app *app.App) *Bridge {
	tt := NewClient()
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		icp:         tt,
		queryLog:    service.NewICPQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		dataCache:   service.NewIcpDBService(),
		app:         app,
	}
}

type QueryResult struct {
	*Result
	TaskID  int64 `json:"taskID"`
	MaxPage int   `json:"maxPage"`
}

// GetItem 只是为了向前端暴露Item结构体
func (r *Bridge) GetItem() *icp.Item {
	return nil
}

func (r *Bridge) Query(taskID int64, query string, pageNum, pageSize int, serviceType string) (map[string]any, error) {
	//获取缓存
	log, err := r.queryLog.GetByTaskID(taskID)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if log.Total != 0 {
		cacheItems := r.dataCache.GetByTaskID(taskID)
		items := make([]*icp.Item, 0)
		for _, cacheItem := range cacheItems {
			items = append(items, cacheItem.Item)
		}
		return map[string]any{
			"taskID":   taskID,
			"items":    items,
			"pageNum":  pageNum,
			"pageSize": pageSize,
			"total":    log.Total,
		}, nil
	}
	ctx, cancel := context.WithCancel(context.Background())
	var e error
	result, err2 := backoff.RetryWithData(func() (*Result, error) {
		result, err3 := r.icp.PageNum(pageNum).PageSize(pageSize).ServiceType(serviceType).Query(query)
		if err3 != nil {
			if err3.Error() == IllegalRequestError.Error() || err3.Error() == CaptchaMismatchError.Error() || err3.Error() == TokenExpiredError.Error() {
				err4 := r.icp.setTokenFromRemote()
				if err4 != nil {
					logger.Info(err4.Error())
					e = err4
					cancel()         // 取消上下文
					return nil, err4 // 返回什么都可以,因为上下文被取消了
				}
				return nil, err3 // 触发重试
			}
			logger.Info(err3.Error())
			return nil, err3
		}
		return result, nil
	}, backoff.WithContext(backoff.WithMaxRetries(backoff.NewExponentialBackOff(), 3), ctx))
	if e != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if err2 != nil {
		logger.Info(err2.Error())
		return nil, err2
	}
	taskID = idgen.NextId()
	if pageNum == 1 { //用于导出
		_ = r.queryLog.Add(&models.ICPQueryLog{
			UnitName:    query,
			ServiceType: serviceType,
			Total:       result.Total,
		}, taskID)
	}
	_ = r.dataCache.BatchInsert(taskID, result.Items)
	return map[string]any{
		"taskID":   taskID,
		"items":    result.Items,
		"pageNum":  result.PageNum,
		"pageSize": result.PageSize,
		"total":    result.Total,
	}, nil
}

func (r *Bridge) Export(taskID int64) error {
	queryLog, err := r.queryLog.GetByTaskID(taskID)
	if err != nil {
		logger.Info(err.Error())
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)

	items := make([]*icp.Item, 0)
	result, err := r.icp.PageNum(1).PageSize(1).ServiceType(queryLog.ServiceType).Query(queryLog.UnitName)
	if err != nil {
		logger.Info(err.Error())
		r.downloadLog.UpdateStatus(fileID, event.Statuses.Error, err.Error())
		return err
	}
	result, err = r.icp.PageNum(1).PageSize(result.Total).ServiceType(queryLog.ServiceType).Query(queryLog.UnitName)
	if err != nil {
		logger.Info(err.Error())
		r.downloadLog.UpdateStatus(fileID, event.Statuses.Error, err.Error())
		return err
	}
	items = append(items, result.Items...)
	var data [][]any
	headers := append([]any{"序号"}, []any{"企业名称", "备案内容",
		"备案号", "备案类型", "备案法人", "单位性质", "审核日期"}...)
	data = append(data, headers)
	for index, item := range items {
		var tmpItem = []any{
			index + 1,
			item.UnitName,
			item.ServiceName,
			item.ServiceLicence,
			item.ServiceType,
			item.LeaderName,
			item.NatureName,
			item.UpdateRecordTime}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, outputAbsFilepath); err != nil {
		logger.Info(err.Error())
		r.downloadLog.UpdateStatus(fileID, event.Statuses.Error, err.Error())
		return err
	}
	r.downloadLog.UpdateStatus(fileID, event.Statuses.Completed, "")
	event.HasNewDownloadLogItemEventEmit(event.Events.HasNewIcpDownloadItem)
	return nil
}

func (r *Bridge) BatchQuery(unitList []string, serviceTypeList []string) {
	var client *ICP
	if r.proxy != "" {
		client = NewClient()
		client.UseProxyManager(config.ProxyManager)
	} else {
		client = r.icp
	}
	for i, unitName := range unitList {
		for j, serviceType := range serviceTypeList {
			result, err := client.PageNum(1).PageSize(1).ServiceType(serviceType).Query(unitName)
			if err != nil {
				event.Emit(event.Events.ICPBatchQuery, map[string]any{
					"code":    event.Statuses.Error,
					"message": err.Error(),
				})
				return
			}
			if i == len(unitList)-1 && j == len(serviceTypeList)-1 {
				event.Emit(event.Events.ICPBatchQuery, map[string]any{
					"code":  event.Statuses.Completed,
					"items": result.Items,
				})
			} else {
				event.Emit(event.Events.ICPBatchQuery, map[string]any{
					"code":  event.Statuses.InProgress,
					"items": result.Items,
				})
			}
		}
	}
}
