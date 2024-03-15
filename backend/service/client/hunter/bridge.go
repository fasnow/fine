package hunter

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/service/model/hunter"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"strings"
	"time"
)

type Bridge struct {
	app         *app.App
	hunter      *Hunter
	queryLog    *service.HunterQueryLog
	downloadLog *service.DownloadLogService
	dataCache   *service.HunterDBService
	token       *service.HunterRestTokenDBService
	cacheTotal  *service.CacheTotal
}

func NewHunterBridge(app *app.App) *Bridge {
	hunterAuth := config.GetSingleton().GetHunterAuth()
	return &Bridge{
		hunter:      NewClient(hunterAuth.Key),
		queryLog:    service.NewHunterQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		dataCache:   service.NewHunterDBService(),
		token:       service.NewHunterResidualTokenDBService(),
		cacheTotal:  service.NewCacheTotal(),
		app:         app,
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	TaskID  int64 `json:"id"`
}

type QueryOptions struct {
	Query      string `json:"query"`
	StartTime  string `json:"startTime"`
	EndTime    string `json:"endTime"`
	Page       int    `json:"page"`
	Size       int    `json:"size"`
	IsWeb      int    `json:"isWeb"`
	StatusCode string `json:"statusCode"`
	PortFilter bool   `json:"portFilter"`
}

func (b *Bridge) Query(taskID int64, query string, page, pageSize int, startTime, endTime string, isWeb int, statusCode string, portFilter bool) (*QueryResult, error) {
	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.GetByTaskID(taskID)
		if err != nil {
			return nil, err
		}
		queryResult.Total = total
		queryResult.Page = page
		queryResult.TaskID = taskID
		queryResult.RestQuota = b.token.GetLast() //从数据库获取剩余积分
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().
		Query(query).
		Page(page).
		Size(pageSize).
		StartTime(startTime).
		EndTime(endTime).
		StatusCode(statusCode).
		IsWeb(isWeb).
		PortFilter(portFilter).Build()
	result, err := b.hunter.Get(req)
	if err != nil {
		return nil, err
	}
	b.token.Add(result.RestQuota) //剩余积分添加到数据库记录
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		id := idgen.NextId()
		if page == 1 {
			_ = b.queryLog.Add(&model.HunterQueryLog{
				BaseModel:  model.BaseModel{},
				Query:      query,
				StartTime:  startTime,
				EndTime:    endTime,
				Page:       page,
				PageSize:   pageSize,
				IsWeb:      isWeb,
				StatusCode: statusCode,
				PortFilter: portFilter,
				Total:      result.Total,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.BatchInsert(id, result.Items)
		queryResult.TaskID = id
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
	queryResult.Result = result
	return queryResult, nil
}

func (b *Bridge) Export(taskID, page, pageSize int64) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetBaseDataDir()
	filename := fmt.Sprintf("Hunter_%s.xlsx", utils.GenTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	go func() {
		var retry = 10
		interval := config.GetSingleton().GetDefaultInterval().Hunter
		exportDataTaskID := idgen.NextId()
		for index := int64(1); index <= page; index++ {
			req := NewGetDataReqBuilder().
				Query(queryLog.Query).
				Page(int(index)).
				Size(int(pageSize)).
				StartTime(queryLog.StartTime).
				EndTime(queryLog.EndTime).
				StatusCode(queryLog.StatusCode).
				IsWeb(queryLog.IsWeb).
				PortFilter(queryLog.PortFilter).Build()
			result, err := b.hunter.Get(req)
			if err != nil {
				if err.Error() == "请求太多啦，稍后再试试" {
					index--
					retry--
					time.Sleep(time.Duration(interval) * time.Millisecond)
					continue
				}
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					cacheItems, err := b.dataCache.GetByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*hunter.Item, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.Item)
					}
					if err := b.hunter.Export(exportItems, outputAbsFilepath); err != nil {
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
			b.token.Add(result.RestQuota) //剩余积分添加到数据库记录
			time.Sleep(time.Duration(interval) * time.Millisecond)
		}
		cacheItems, err := b.dataCache.GetByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*hunter.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		if err := b.hunter.Export(exportItems, outputAbsFilepath); err != nil {
			return
		}
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNewHunterDownloadItem)
	}()
	return nil
}

func (b *Bridge) SetAuth(key string) error {
	if err := config.GetSingleton().SaveHunterAuth(key); err != nil {
		return err

	}
	b.hunter.SetAuth(key)
	return nil
}

func (b *Bridge) GetRestToken() int {
	return b.token.GetLast()
}
