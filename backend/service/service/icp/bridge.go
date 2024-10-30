package icp

import (
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/constraint"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/logger"
	"fine/backend/proxy"
	"fine/backend/service/model/icp"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
)

type Bridge struct {
	app         *app.App
	icp         *ICP
	queryLog    *service.ICPQueryLog
	downloadLog *service.DownloadLogService
}

func NewICPBridge(app *app.App) *Bridge {
	tt := NewClient()
	proxy.GetSingleton().Add(tt)
	return &Bridge{
		icp:         tt,
		queryLog:    service.NewICPQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		app:         app,
	}
}

type QueryResult struct {
	*Result
	TaskID  int64 `json:"task_id"`
	MaxPage int   `json:"maxPage"`
}

// GetItem 只是为了向前端暴露Item结构体
func (b *Bridge) GetItem() *icp.Item {
	return nil
}

func (b *Bridge) Query(query string, page, pageSize int, serviceType string) (map[string]any, error) {
	var taskID int64
	taskID = idgen.NextId()
	_ = b.queryLog.Add(&model.ICPQueryLog{
		UnitName:    query,
		ServiceType: serviceType,
	}, taskID)
	result, err := b.icp.Page(page).PageSize(pageSize).ServiceType(serviceType).Query(query)
	if err != nil {
		logger.Info(err.Error())
		return nil, err

	}
	return map[string]any{
		"code":    constraint.Statuses.CodeOK,
		"message": "",
		"data": map[string]any{
			"taskID": taskID,
			"items":  result.Items,
			"page":   result.Page,
			"size":   result.Size,
			"total":  result.Total,
		},
	}, nil
}

func (b *Bridge) Export(taskID int64) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		logger.Info(err.Error())
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)

	items := make([]*icp.Item, 0)
	result, err := b.icp.Page(1).PageSize(1).ServiceType(queryLog.ServiceType).Query(queryLog.UnitName)
	if err != nil {
		logger.Info(err.Error())
		b.downloadLog.UpdateStatus(fileID, constraint.Statuses.ExportError, err.Error())
		return err
	}
	result, err = b.icp.Page(1).PageSize(result.Total).ServiceType(queryLog.ServiceType).Query(queryLog.UnitName)
	if err != nil {
		logger.Info(err.Error())
		b.downloadLog.UpdateStatus(fileID, constraint.Statuses.ExportError, err.Error())
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
		b.downloadLog.UpdateStatus(fileID, constraint.Statuses.ExportError, err.Error())
		return err
	}
	b.downloadLog.UpdateStatus(fileID, constraint.Statuses.Exported, "")
	constraint.HasNewDownloadLogItemEventEmit(constraint.Events.HasNewIcpDownloadItem)
	return nil
}

func (b *Bridge) GetImage() (*icp.Image, error) {
	image, err := b.icp.GetImage()
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return image, nil
}

func (b *Bridge) IsSignExpired() bool {
	return b.icp.IsSignExpired()
}

func (b *Bridge) CheckImage(pointJson string) (*map[string]any, error) {
	sign, smallImage, err := b.icp.CheckImage(pointJson)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return &map[string]any{
		"sign":       sign,
		"smallImage": smallImage,
	}, nil
}
