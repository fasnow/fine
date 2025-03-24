package fofa

import (
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/history"
	"fine/backend/constant/status"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/service/model/fofa"
	service2 "fine/backend/service/service"
	"fine/backend/service/service/exportlog"
	"github.com/cenkalti/backoff/v4"
	"github.com/yitter/idgenerator-go/idgen"
	"time"
)

type Bridge struct {
	app             *application.Application
	fofa            *Fofa
	fofaRepo        repository.FofaRepository
	historyRepo     repository.HistoryRepository
	cacheTotal      repository.CacheTotal
	exportLogBridge *exportlog.Bridge
}

func NewBridge(app *application.Application) *Bridge {
	tt := New(app.Config.Fofa.Token)
	tt.UseProxyManager(app.ProxyManager)
	db := database.GetConnection()
	return &Bridge{
		app:             app,
		fofa:            tt,
		fofaRepo:        repository.NewFofaRepository(db),
		cacheTotal:      repository.NewCacheTotal(db),
		historyRepo:     repository.NewHistoryRepository(db),
		exportLogBridge: exportlog.NewBridge(app),
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	PageID  int64 `json:"pageID"`
}

func (r *Bridge) Query(pageID int64, query string, pageNum, pageSize int64, fields string, full bool) (*QueryResult, error) {
	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, q := r.cacheTotal.GetByPageID(pageID)
	if total != 0 {
		cacheItems, err := r.fofaRepo.GetBulkByPageID(pageID)
		if err != nil {
			r.app.Logger.Error(err)
			return nil, err
		}
		queryResult.Query = q
		queryResult.Total = total
		queryResult.PageNum = int(pageNum)
		queryResult.PageSize = int(pageSize)
		queryResult.PageID = pageID
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
	}

	if err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: history.FOFA,
	}); err != nil {
		r.app.Logger.Warn(err)
	}

	//获取新数据
	req := NewSearchAllReqBuilder().
		Query(query).
		Page(pageNum).
		Size(pageSize).Fields(fields).Full(full).Build()
	result, err := r.fofa.Query(req)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	tmpPageID := idgen.NextId()
	if result.Total > 0 {
		if pageNum == 1 {
			// 缓存查询成功的条件，用于导出
			if err := r.fofaRepo.CreateQueryField(&models.FOFAQueryLog{
				PageID: tmpPageID,
				Query:  query,
				Fields: fields,
				Full:   full,
				Total:  result.Total,
			}); err != nil {
				r.app.Logger.Warn(err)
			}
		}
		r.cacheTotal.Add(tmpPageID, result.Total, query)
		if err := r.fofaRepo.CreateBulk(tmpPageID, result.Items); err != nil {
			r.app.Logger.Warn(err)
		}
	}
	queryResult.PageID = tmpPageID
	queryResult.Result = result
	return queryResult, nil
}

func (r *Bridge) Export(pageID int64, pageNum, pageSize int64) (int64, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID":   pageID,
		"pageNum":  pageNum,
		"pageSize": pageSize,
	}).Debug("传入参数")
	queryLog, err := r.fofaRepo.GetQueryFieldByPageID(pageID)
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	r.app.Logger.Debug(queryLog)
	exportID, outputAbsFilepath, err := r.exportLogBridge.Create("FOFA")
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		for index := int64(1); index <= pageNum; index++ {
			result, err1 := backoff.RetryWithData(func() (*Result, error) {
				req := NewSearchAllReqBuilder().
					Query(queryLog.Query).
					Page(index).
					Size(pageSize).
					Fields(queryLog.Fields).
					Full(queryLog.Full).
					Build()
				result, err2 := r.fofa.Query(req)
				if err2 != nil {
					r.app.Logger.Debug(err2)
					return nil, err2 // 触发重试
				}
				return result, nil
			}, service2.GetBackOffWithMaxRetries(10, r.app.Config.Fofa.Interval, 1))
			if err1 != nil {
				r.app.Logger.Error(err1)
				break
			} else {
				if err2 := r.fofaRepo.CreateBulk(exportID, result.Items); err2 != nil {
					r.app.Logger.Error(err2)
				}
			}
			time.Sleep(r.app.Config.Fofa.Interval)
		}
		cacheItems, err2 := r.fofaRepo.GetBulkByPageID(exportID)
		if err2 != nil {
			r.app.Logger.Error(err2)
			data := event.EventDetail{
				ID:     exportID,
				Status: status.Error,
				Error:  err.Error(),
			}
			r.app.Logger.Error(err, data)
			event.EmitNewExportItemEvent(event.FOFAExport, data)
			return
		}
		exportItems := make([]*fofa.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		service2.SaveToExcel(nil, exportID, event.FOFAExport, r.app.Logger, func() error {
			return r.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields)
		})
	}()
	return exportID, nil
}

func (r *Bridge) GetUserInfo() (*User, error) {
	user, err := r.fofa.User()
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return user, nil
}

func (r *Bridge) SetAuth(key string) error {
	r.app.Config.Fofa.Token = key
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	r.fofa.SetAuth(key)
	return nil
}

func (r *Bridge) StatisticalAggs(fields, query string) (*StatisticalAggsResult, error) {
	if err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: history.FOFA,
	}); err != nil {
		r.app.Logger.Info(fields, query, err)
	}
	return r.fofa.StatisticalAggs.Query(NewStatAggsReqBuilder().Fields(fields).Query(query).Build())
}

func (r *Bridge) HostAggs(host string) (*HostAggsResult, error) {
	if err := r.historyRepo.CreateHistory(&models.History{
		Key:  host,
		Type: history.FOFA,
	}); err != nil {
		r.app.Logger.Info(host, err)
	}
	return r.fofa.HostAggs.Query(NewHostStatReqBuilder().Detail(true).Host(host).Build())
}
