package quake

import (
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/proxy"
	quakeModel "fine/backend/service/model/quake"
	"fine/backend/utils"

	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"time"
)

type Bridge struct {
	app         *app.App
	quake       *Quake
	queryLog    *service.QuakeQueryLog
	downloadLog *service.DownloadLogService
	dataCache   *service.QuakeDBService
	token       *service.HunterRestTokenDBService
	cacheTotal  *service.CacheTotal
}

func NewQuakeBridge(app *app.App) *Bridge {
	t := config.GetSingleton().GetQuake()
	tt := NewClient(t.Token)
	proxy.GetSingleton().Add(tt)
	return &Bridge{
		quake:       tt,
		queryLog:    service.NewQuakeQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		dataCache:   service.NewQuakeDBService(),
		cacheTotal:  service.NewCacheTotal(),
		app:         app,
	}
}

func (b *Bridge) SetAuth(key string) error {
	t := config.GetQuake()
	t.Token = key
	if err := config.GetSingleton().SaveQuake(t); err != nil {
		logger.Info(err.Error())
		return err

	}
	b.quake.SetAuth(key)
	return nil
}

type RealtimeServiceQueryResult struct {
	Result  RSDQueryResult `json:"result"`
	TaskID  int64          `json:"id"`
	MaxPage int            `json:"maxPage"`
}

type RealtimeDataQueryOptions struct {
	Query       string   `json:"query,omitempty"`
	Rule        string   `json:"rule,omitempty"`
	IpList      []string `json:"ipList,omitempty"`
	Page        int      `json:"page,omitempty"`
	PageSize    int      `json:"size,omitempty"`
	IgnoreCache bool     `json:"ignoreCache,omitempty"`
	StartTime   string   `json:"startTime,omitempty"`
	EndTime     string   `json:"endTime,omitempty"`
	Include     []string `json:"include,omitempty"`
	Exclude     []string `json:"exclude,omitempty"`
	Latest      bool     `json:"latest,omitempty"` //仅用于实时服务数据查询
}

func (b *Bridge) GetUserInfo() (*User, error) {
	user, err := b.quake.User()
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return user, nil
}

func (b *Bridge) RealtimeServiceDataQuery(taskID int64, options RealtimeDataQueryOptions) (*RealtimeServiceQueryResult, error) {
	queryResult := &RealtimeServiceQueryResult{
		Result: RSDQueryResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = options.Page
		queryResult.Result.Size = options.PageSize
		queryResult.TaskID = taskID
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.RealtimeServiceItem)
		}
		return queryResult, nil
	}

	req := NewGetRealtimeDataBuilder().
		Query(options.Query).
		Page(options.Page).
		Size(options.PageSize).
		EndTime(options.EndTime).
		StartTime(options.StartTime).
		IpList(options.IpList).
		Include(options.Include).
		Exclude(options.Exclude).
		Latest(options.Latest).
		IgnoreCache(options.IgnoreCache).
		Rule(options.Rule).
		Build()
	result, err := b.quake.Realtime.Service(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if options.Page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.QuakeRealtimeQueryLog{
				Query:       options.Query,
				Rule:        options.Rule,
				IpList:      options.IpList,
				Page:        options.Page,
				PageSize:    options.PageSize,
				IgnoreCache: options.IgnoreCache,
				StartTime:   options.StartTime,
				EndTime:     options.EndTime,
				Include:     options.Include,
				Exclude:     options.Exclude,
				Latest:      options.Latest,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, options.Query)
		_ = b.dataCache.BatchInsert(id, result.Items)
		queryResult.TaskID = id
	}
	for i := 0; i < len(result.Items); i++ {
		var item = &result.Items[i]
		var locationCn []string
		var locationEn []string
		{
			if (*item).Location.CountryCn != "" {
				locationCn = append(locationCn, (*item).Location.CountryCn)
			}
			if (*item).Location.ProvinceCn != "" {
				locationCn = append(locationCn, (*item).Location.ProvinceCn)
			}
			if (*item).Location.CityCn != "" {
				locationCn = append(locationCn, (*item).Location.CityCn)
			}
			if (*item).Location.StreetCn != "" {
				locationCn = append(locationCn, (*item).Location.StreetCn)
			}
			if (*item).Location.CountryEn != "" {
				locationEn = append(locationEn, (*item).Location.CountryEn)
			}
			if (*item).Location.ProvinceEn != "" {
				locationEn = append(locationEn, (*item).Location.ProvinceEn)
			}
			if (*item).Location.CityEn != "" {
				locationEn = append(locationEn, (*item).Location.CityEn)
			}
			if (*item).Location.StreetEn != "" {
				locationEn = append(locationEn, (*item).Location.StreetEn)
			}
		}
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) RealtimeServiceDataExport(taskID int64, page, pageSize int) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		logger.Info(err.Error())
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("Quake_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)

	go func() {
		var retry = 10
		interval := config.GetQuake().Interval
		exportDataTaskID := idgen.NextId()
		for index := 1; index <= page; index++ {
			req := NewGetRealtimeDataBuilder().
				Query(queryLog.Query).
				Page(index).
				Size(pageSize).
				EndTime(queryLog.EndTime).
				StartTime(queryLog.StartTime).
				IpList(queryLog.IpList).
				Include(queryLog.Include).
				Exclude(queryLog.Exclude).
				Latest(queryLog.Latest).
				IgnoreCache(queryLog.IgnoreCache).
				Rule(queryLog.Rule).
				Build()
			result, err := b.quake.Realtime.Service(req)
			if err != nil {
				logger.Info(err.Error())
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					cacheItems, err := b.dataCache.GetByTaskID(exportDataTaskID)
					if err != nil {
						logger.Info(err.Error())
						return
					}
					exportItems := make([]quakeModel.RealtimeServiceItem, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, *cacheItem.RealtimeServiceItem)
					}
					if err := b.quake.Export(exportItems, outputAbsFilepath); err != nil {
						logger.Info(err.Error())
						return
					}
					break
				}
				retry--
				index--
				time.Sleep(interval)
				continue
			}
			_ = b.dataCache.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}
		cacheItems, err := b.dataCache.GetByTaskID(exportDataTaskID)
		if err != nil {
			logger.Info(err.Error())
			return
		}
		exportItems := make([]quakeModel.RealtimeServiceItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, *cacheItem.RealtimeServiceItem)
		}
		if err := b.quake.Export(exportItems, outputAbsFilepath); err != nil {
			logger.Info(err.Error())
			return
		}
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNewQuakeDownloadItem)
	}()
	return nil
}

//
//func RealtimeHostDataQuery(c *gin.Context) {
//	var options routes.QuakeRealtimeDataQueryOptions
//	var cacheItem routes.QuakeExportCacheItem
//	var responseWithUUID struct {
//		*quakeCient.RHDQueryResult
//		UUID    string `json:"id"`
//		MaxPage int    `json:"maxPage"`
//	}
//	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
//		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
//		return
//	}
//	if options.Size <= 0 {
//		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(client.ErrorQuerySize))
//	}
//	if options.Page <= 0 {
//		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(client.ErrorQueryPage))
//	}
//	req := quakeCient.NewGetRealtimeDataBuilder().
//		Query(options.Query).
//		Page(options.Page).
//		Size(options.Size).
//		EndTime(options.EndTime).
//		StartTime(options.StartTime).
//		IpList(options.IpList).
//		Include(options.Include).
//		Exclude(options.Exclude).
//		Latest(options.Latest).
//		IgnoreCache(options.IgnoreCache).
//		Rule(options.Rule).
//		Build()
//	result, err := initialize.QuakeClient.Realtime.Host(req)
//	if err != nil {
//		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
//		return
//	}
//	if result.Total > 0 {
//		// 缓存查询成功的条件，用于导出
//		uuid := initialize.QueryCache.GenerateUUID()
//		cacheItem.Options = options
//		cacheItem.Total = result.Total
//		cacheItem.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
//		initialize.QueryCache.Set(uuid, cacheItem, initialize.DefaultCacheTimeout)
//		responseWithUUID.UUID = uuid
//		responseWithUUID.MaxPage = cacheItem.Page
//	}
//	responseWithUUID.RHDQueryResult = result
//	httpoutput.HttpStdOutput(c, responseWithUUID)
//}
//
//func DeepServiceDataQuery(c *gin.Context) {
//}
//
//func DeepHostDataQuery(c *gin.Context) {
//}
//
//func AggregationServiceDataQuery(c *gin.Context) {
//}
//
//func AggregationHostDataQuery(c *gin.Context) {
//}
//
//func QueryAggregationData(c *gin.Context) {
//}
//
//func QueryFaviconSimilarityData(c *gin.Context) {
//	//var body struct {
//	//	FaviconHash string  `json:"faviconHash"`
//	//	Similar     float64 `json:"similar"`
//	//	Size        int     `json:"size"`
//	//	IgnoreCache bool    `json:"ignoreCache"`
//	//	StartTime   string  `json:"startTime"`
//	//	EndTime     string  `json:"endTime"`
//	//}
//	//if err := c.ShouldBind(&body); err != nil && err.Error() != NoJsonKeyStringError {
//	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(err))
//	//	return
//	//}
//	//result, err := QuakeClient.QueryFaviconSimilarityData(body.FaviconHash, body.Similar, body.Size, body.IgnoreCache, body.StartTime, body.EndTime)
//	//if err != nil {
//	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(err))
//	//	return
//	//}
//	//HttpStdOutput(c, result)
//}
//

//
//func ExportStatus(c *gin.Context) {
//	var id = c.Query("id")
//	var cache routes.QuakeExportCacheItem
//	if val, ok := initialize.QueryCache.Get(id); ok {
//		if cache, ok = val.(routes.QuakeExportCacheItem); !ok {
//			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
//			return
//		}
//	} else {
//		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
//		return
//	}
//	if cache.Message == routes.Finished {
//		httpoutput.HttpStdOutput(c, routes.ExportStatusResponse{
//			Message:  routes.Finished,
//			Filename: cache.Filename,
//		})
//		config2.AddDownloadLogItem(cache.Filename)
//		cache.Message = routes.Waiting
//		cache.Filename = ""
//		initialize.QueryCache.Update(id, cache)
//	} else {
//		httpoutput.HttpStdOutput(c, routes.ExportStatusResponse{
//			Message: cache.Message,
//		})
//	}
//}
