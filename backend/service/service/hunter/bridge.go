package hunter

import (
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/history"
	"fine/backend/constant/status"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/service/model/hunter"
	service2 "fine/backend/service/service"
	"fine/backend/service/service/exportlog"
	"github.com/cenkalti/backoff/v4"
	"github.com/yitter/idgenerator-go/idgen"
	"strings"
	"time"
)

type Bridge struct {
	app             *application.Application
	hunter          *Hunter
	cacheTotal      repository.CacheTotal
	hunterRepo      repository.HunterRepository
	historyRepo     repository.HistoryRepository
	exportLogBridge *exportlog.Bridge
}

func NewBridge(app *application.Application) *Bridge {
	tt := NewClient(app.Config.Hunter.Token)
	tt.UseProxyManager(app.ProxyManager)
	db := database.GetConnection()
	return &Bridge{
		app:             app,
		hunter:          tt,
		cacheTotal:      repository.NewCacheTotal(db),
		hunterRepo:      repository.NewHunterRepository(db),
		historyRepo:     repository.NewHistoryRepository(db),
		exportLogBridge: exportlog.NewBridge(app),
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	PageID  int64 `json:"pageID"`
}

type QueryOptions struct {
	Query      string `json:"query"`
	StartTime  string `json:"startTime"`
	EndTime    string `json:"endTime"`
	PageNum    int    `json:"page"`
	PageSize   int    `json:"size"`
	IsWeb      int    `json:"isWeb"`
	StatusCode string `json:"statusCode"`
	PortFilter bool   `json:"portFilter"`
}

func (r *Bridge) Query(pageID int64, query string, pageNum, pageSize int, startTime, endTime string, isWeb int, statusCode string, portFilter bool) (*QueryResult, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID":     pageID,
		"query":      query,
		"pageNum":    pageNum,
		"pageSize":   pageSize,
		"startTime":  startTime,
		"endTime":    endTime,
		"isWeb":      isWeb,
		"statusCode": statusCode,
		"portFilter": portFilter,
	}).Debug("传入参数")

	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByPageID(pageID)
	if total != 0 {
		cacheItems, err := r.hunterRepo.GetBulkByPageID(pageID)
		if err != nil {
			r.app.Logger.Error(err)
			return nil, err
		}
		queryResult.Total = total
		queryResult.PageNum = pageNum
		queryResult.PageID = pageID
		u, err := r.hunterRepo.GetLastUserInfo()
		if err != nil {
			queryResult.User = u.User //从数据库获取剩余积分
		}
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
	}

	if err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: history.Hunter,
	}); err != nil {
		r.app.Logger.Warn(err)
	}

	//获取新数据
	req := NewQueryReqBuilder().
		Query(query).
		Page(pageNum).
		Size(pageSize).
		StartTime(startTime).
		EndTime(endTime).
		StatusCode(statusCode).
		IsWeb(isWeb).
		PortFilter(portFilter).Build()
	result, err := r.hunter.Query(req)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	r.hunterRepo.CreateUserInfo(result.User) //剩余积分添加到数据库记录
	tmpPageID := idgen.NextId()
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		if pageNum == 1 {
			_ = r.hunterRepo.CreateQueryField(&models.HunterQueryLog{
				PageID:     tmpPageID,
				Query:      query,
				StartTime:  startTime,
				EndTime:    endTime,
				PageNum:    pageNum,
				PageSize:   pageSize,
				IsWeb:      isWeb,
				StatusCode: statusCode,
				PortFilter: portFilter,
				Total:      result.Total,
			})
		}
		r.cacheTotal.Add(tmpPageID, result.Total, query)
		if err := r.hunterRepo.CreateBulk(tmpPageID, result.Items); err != nil {
			r.app.Logger.Warn(err)
		}
	}
	for i := 0; i < len(result.Items); i++ {
		var location []string
		item := &result.Items[i]
		if (*item).Country != "" {
			location = append(location, (*item).Country)
		}
		if (*item).Province != "" {
			location = append(location, (*item).Province)
		}
		if (*item).City != "" {
			location = append(location, (*item).City)
		}
		(*item).City = strings.Join(location, " ")
	}
	queryResult.PageID = tmpPageID
	queryResult.Result = result
	return queryResult, nil
}

func (r *Bridge) Export(pageID, pageNum, pageSize int64) (int64, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID":   pageID,
		"pageNum":  pageNum,
		"pageSize": pageSize,
	}).Debug("传入参数")
	queryLog, err := r.hunterRepo.GetQueryFieldByTaskID(pageID)
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	r.app.Logger.Debug(queryLog)
	exportID, outputAbsFilepath, err := r.exportLogBridge.Create("Hunter")
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		for index := int64(1); index <= pageNum; index++ {
			result, err1 := backoff.RetryWithData(func() (*Result, error) {
				req := NewQueryReqBuilder().
					Query(queryLog.Query).
					Page(int(index)).
					Size(int(pageSize)).
					StartTime(queryLog.StartTime).
					EndTime(queryLog.EndTime).
					StatusCode(queryLog.StatusCode).
					IsWeb(queryLog.IsWeb).
					PortFilter(queryLog.PortFilter).Build()
				result, err2 := r.hunter.Query(req)
				if err2 != nil {
					r.app.Logger.Error(err2)
					return nil, err2
				}
				return result, nil
			}, service2.GetBackOffWithMaxRetries(10, r.app.Config.Hunter.Interval, 1))
			if err1 != nil {
				r.app.Logger.Error(err1)
			} else {
				if err2 := r.hunterRepo.CreateBulk(exportID, result.Items); err2 != nil {
					r.app.Logger.Error(err2)
				}
				r.hunterRepo.CreateUserInfo(result.User) //剩余积分添加到数据库记录
			}
			time.Sleep(r.app.Config.Hunter.Interval)
		}
		cacheItems, err2 := r.hunterRepo.GetBulkByPageID(exportID)
		if err2 != nil {
			r.app.Logger.Error(err2)
			data := event.EventDetail{
				ID:     exportID,
				Status: status.Error,
				Error:  err.Error(),
			}
			r.app.Logger.Info(err, data)
			event.EmitNewExportItemEvent(event.HunterExport, data)
			return
		}
		exportItems := make([]*hunter.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		service2.SaveToExcel(nil, exportID, event.HunterExport, r.app.Logger, func() error {
			return r.hunter.Export(exportItems, outputAbsFilepath)
		})
	}()
	return exportID, nil
}

func (r *Bridge) SetAuth(key string) error {
	r.app.Config.Hunter.Token = key
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		return err

	}
	r.hunter.SetAuth(key)
	return nil
}

func (r *Bridge) GetUserInfo() (*hunter.User, error) {
	u, err := r.hunterRepo.GetLastUserInfo()
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return &u.User, nil
}
