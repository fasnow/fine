package fofa

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/sdk/model/fofa"
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
	fofaAuth := config.GetSingleton().GetFofaAuth()
	return &Bridge{
		fofa:        NewClient(fofaAuth.Email, fofaAuth.Key),
		queryLog:    service.NewFOFAQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		dataCache:   service.NewFofaDBService(),
		cacheTotal:  service.NewCacheTotal(),
		app:         app,
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	TaskID  int64 `json:"id"`
}

func (b *Bridge) Query(taskID int64, query string, page, pageSize int64, fields string, full bool) (*QueryResult, error) {
	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, q := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.GetByTaskID(taskID)
		if err != nil {
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
	result, err := b.fofa.Get(req)
	if err != nil {
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.FOFAQueryLog{
				Query:  query,
				Fields: fields,
				Full:   full,
				Total:  result.Total,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.BatchInsert(id, result.Items)
		queryResult.TaskID = id
	}
	queryResult.Result = result
	return queryResult, nil
}

func (b *Bridge) Export(taskID int64, page, pageSize int64) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetBaseDataDir()
	filename := fmt.Sprintf("Fofa_%s.xlsx", utils.GenTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GetSingleton().GetDefaultInterval().Fofa
		for index := int64(1); index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(pageSize).
				Fields(queryLog.Fields).
				Full(queryLog.Full).
				Build()
			result, err2 := b.fofa.Get(req)
			if err2 != nil {
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					cacheItems, err := b.dataCache.GetByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*fofa.Item, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.Item)
					}
					if err := b.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(time.Duration(interval) * time.Millisecond)
				continue
			}
			_ = b.dataCache.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(time.Duration(interval) * time.Millisecond)
		}

		cacheItems, err := b.dataCache.GetByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*fofa.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		if err := b.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
			return
		}
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNewDownloadItem)
	}()
	return nil
}

func (b *Bridge) GetUserInfo() (*User, error) {
	user, err := b.fofa.User()
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (b *Bridge) SetAuth(email, key string) error {
	if err := config.GetSingleton().SaveFofaAuth(email, key); err != nil {
		return err

	}
	b.fofa.SetAuth(email, key)
	return nil
}
