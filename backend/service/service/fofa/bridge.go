package fofa

import (
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/proxy"
	"fine/backend/service/model/fofa"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"time"
)

type Bridge struct {
	app         *app.App
	fofa        *Fofa
	queryLog    *service.FOFAQueryLog
	downloadLog *service.DownloadLogService
	dataCache   *service.FofaDBService
	cacheTotal  *service.CacheTotal
}

func NewFofaBridge(app *app.App) *Bridge {
	//t := config.GetFofa()
	//tt := NewClient(t.Email, t.Token)
	tt := NewClient("t.Email", "t.Token")
	proxy.GetSingleton().Add(tt)
	return &Bridge{
		fofa: tt,
		//queryLog:    service.NewFOFAQueryLog(),
		//downloadLog: service.NewDownloadLogService(),
		//dataCache:   service.NewFofaDBService(),
		//cacheTotal:  service.NewCacheTotal(),
		app: app,
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	TaskID  int64 `json:"id"`
}

func (r *Bridge) Query(taskID int64, query string, page, pageSize int64, fields string, full bool) (*QueryResult, error) {
	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, q := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.dataCache.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Query = q
		queryResult.Total = total
		queryResult.Page = int(page)
		queryResult.Size = int(pageSize)
		queryResult.TaskID = taskID
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
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
			_ = r.queryLog.Add(&model.FOFAQueryLog{
				Query:  query,
				Fields: fields,
				Full:   full,
				Total:  result.Total,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.dataCache.BatchInsert(id, result.Items)
		queryResult.TaskID = id
	}
	queryResult.Result = result
	return queryResult, nil
}

func (r *Bridge) Export(taskID int64, page, pageSize int64) error {
	queryLog, err := r.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("Fofa_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GetFofa().Interval
		for index := int64(1); index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(pageSize).
				Fields(queryLog.Fields).
				Full(queryLog.Full).
				Build()
			result, err2 := r.fofa.Get(req)
			if err2 != nil {
				logger.Info(err2.Error())
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					cacheItems, err := r.dataCache.GetByTaskID(exportDataTaskID)
					if err != nil {
						logger.Info("fofa 导出失败: " + err.Error())
						return
					}
					exportItems := make([]*fofa.Item, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.Item)
					}
					if err := r.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
						logger.Info("fofa 导出失败: " + err.Error())
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(interval)
				continue
			}
			_ = r.dataCache.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := r.dataCache.GetByTaskID(exportDataTaskID)
		if err != nil {
			logger.Info(err.Error())
			return
		}
		exportItems := make([]*fofa.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		if err := r.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
			logger.Info(err.Error())
			return
		}
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNewFofaDownloadItem)
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

func (r *Bridge) SetAuth(email, key string) error {
	t := config.GetFofa()
	t.Token = key
	t.Email = email
	if err := config.SaveFofa(t); err != nil {
		return err
	}
	r.fofa.SetAuth(email, key)
	return nil
}
