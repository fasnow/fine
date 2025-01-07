package fofa

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/logger"
	"fine/backend/service/model/fofa"
	service2 "fine/backend/service/service"
	"fine/backend/utils"
	"fmt"
	"github.com/cenkalti/backoff/v4"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"time"
)

type Bridge struct {
	app         *app.App
	fofa        *Fofa
	fofaRepo    repository.FofaRepository
	downloadLog *repository.DownloadLogService
	cacheTotal  *repository.CacheTotal
	historyRepo repository.HistoryRepository
}

func NewFofaBridge(app *app.App) *Bridge {
	tt := NewClient(config.GlobalConfig.Fofa.Token)
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		fofa:        tt,
		fofaRepo:    repository.NewFofaRepository(database.GetConnection()),
		downloadLog: repository.NewDownloadLogService(),
		cacheTotal:  repository.NewCacheTotal(),
		app:         app,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	TaskID  int64 `json:"taskID"`
}

func (r *Bridge) Query(taskID int64, query string, page, pageSize int64, fields string, full bool) (*QueryResult, error) {
	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, q := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems := r.fofaRepo.GetByTaskID(taskID)
		queryResult.Query = q
		queryResult.Total = total
		queryResult.PageNum = int(page)
		queryResult.PageSize = int(pageSize)
		queryResult.TaskID = taskID
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().
		Query(query).
		Page(page).
		Size(pageSize).Fields(fields).Full(full).Build()
	result, err := r.fofa.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.fofaRepo.CreateQueryField(&models.FOFAQueryLog{
				Query:  query,
				Fields: fields,
				Full:   full,
				Total:  result.Total,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.fofaRepo.BatchInsert(id, result.Items)
		queryResult.TaskID = id
	}
	queryResult.Result = result
	return queryResult, nil
}

func (r *Bridge) Export(taskID int64, page, pageSize int64) error {
	queryLog, err := r.fofaRepo.GetQueryFieldByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("Fofa_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		for index := int64(1); index <= page; index++ {
			result, err := backoff.RetryWithData(func() (*Result, error) {
				req := NewGetDataReqBuilder().
					Query(queryLog.Query).
					Page(index).
					Size(pageSize).
					Fields(queryLog.Fields).
					Full(queryLog.Full).
					Build()
				result, err := r.fofa.Get(req)
				if err != nil {
					logger.Info(err.Error())
					return nil, err // 触发重试
				}
				return result, nil
			}, service2.GetBackOffWithMaxRetries(10, config.GlobalConfig.Fofa.Interval, 1))
			if err != nil {
				logger.Info(err.Error())
				break
			}
			_ = r.fofaRepo.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(config.GlobalConfig.Fofa.Interval)
		}
		cacheItems := r.fofaRepo.GetByTaskID(exportDataTaskID)
		exportItems := make([]*fofa.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		if err := r.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
			logger.Info(err.Error())
			return
		}
		constant.HasNewDownloadLogItemEventEmit(constant.Events.HasNewFofaDownloadItem)
	}()
	return nil
}

func (r *Bridge) GetUserInfo() (*User, error) {
	user, err := r.fofa.User()
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Bridge) SetAuth(key string) error {
	config.GlobalConfig.Fofa.Token = key
	if err := config.Save(); err != nil {
		return err
	}
	r.fofa.SetAuth(key)
	return nil
}

func (r *Bridge) StatisticalAggs(fields, query string) (*StatisticalAggsResult, error) {
	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}
	return r.fofa.StatisticalAggs.Fields(fields).Query(query)
}

func (r *Bridge) HostAggs(host string) (*HostAggsResult, error) {
	err := r.historyRepo.CreateHistory(&models.History{
		Key:  host,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}
	return r.fofa.HostAggs.Detail(true).Host(host)
}
