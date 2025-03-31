package quake

import (
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/history"
	"fine/backend/constant/status"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	quakeModel "fine/backend/service/model/quake"
	service2 "fine/backend/service/service"
	"fine/backend/service/service/exportlog"
	"github.com/cenkalti/backoff/v4"

	"github.com/yitter/idgenerator-go/idgen"
	"time"
)

type Bridge struct {
	app             *application.Application
	quake           *Quake
	cacheTotal      repository.CacheTotal
	quakeRepo       repository.QuakeRepository
	historyRepo     repository.HistoryRepository
	exportLogBridge *exportlog.Bridge
}

func NewBridge(app *application.Application) *Bridge {
	t := app.Config.Quake
	tt := New(t.Token)
	tt.UseProxyManager(app.ProxyManager)
	db := database.GetConnection()
	return &Bridge{
		app:             app,
		quake:           tt,
		quakeRepo:       repository.NewQuakeRepository(db),
		cacheTotal:      repository.NewCacheTotal(db),
		historyRepo:     repository.NewHistoryRepository(db),
		exportLogBridge: exportlog.NewBridge(app),
	}
}

func (r *Bridge) SetAuth(key string) error {
	r.app.Config.Quake.Token = key
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		r.app.Logger.Error(err)
		return err

	}
	r.quake.SetAuth(key)
	return nil
}

type RealtimeServiceQueryResult struct {
	Result  RealtimeServiceDataResult `json:"result"`
	PageID  int64                     `json:"pageID"`
	MaxPage int                       `json:"maxPage"`
}

type RealtimeDataQueryOptions struct {
	Query       string   `json:"query,omitempty"`
	Rule        string   `json:"rule,omitempty"`
	IpList      []string `json:"ipList,omitempty"`
	PageNum     int      `json:"page,omitempty"`
	PageSize    int      `json:"size,omitempty"`
	IgnoreCache bool     `json:"ignoreCache,omitempty"`
	StartTime   string   `json:"startTime,omitempty"`
	EndTime     string   `json:"endTime,omitempty"`
	Include     []string `json:"include,omitempty"`
	Exclude     []string `json:"exclude,omitempty"`
	Latest      bool     `json:"latest,omitempty"` //仅用于实时服务数据查询
}

func (r *Bridge) GetRealtimeServiceItem() *quakeModel.RealtimeServiceItem {
	return nil
}

func (r *Bridge) GetUserInfo() (*User, error) {
	user, err := r.quake.User()
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return user, nil
}

func (r *Bridge) RealtimeServiceDataQuery(pageID int64, options RealtimeDataQueryOptions) (*RealtimeServiceQueryResult, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID":  pageID,
		"options": options,
	}).Debug("传入参数")

	queryResult := &RealtimeServiceQueryResult{
		Result: RealtimeServiceDataResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByPageID(pageID)
	if total != 0 {
		cacheItems, err := r.quakeRepo.GetBulkByPageID(pageID)
		if err != nil {
			r.app.Logger.Error(err)
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = options.PageNum
		queryResult.Result.PageSize = options.PageSize
		queryResult.PageID = pageID
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, cacheItem.RealtimeServiceItem)
		}
		return queryResult, nil
	}

	if err := r.historyRepo.CreateHistory(&models.History{
		Key:  options.Query,
		Type: history.Quake,
	}); err != nil {
		r.app.Logger.Warn(err)
	}

	//获取新数据
	req := NewRealtimeServiceReqBuilder().
		Query(options.Query).
		Page(options.PageNum).
		Size(options.PageSize).
		EndTime(options.EndTime).
		StartTime(options.StartTime).
		IpList(options.IpList).
		Include(options.Include).
		Exclude(options.Exclude).
		Latest(options.Latest).
		IgnoreCache(options.IgnoreCache).
		Rule(options.Rule)
	result, err := r.quake.RealtimeServer.Service(req)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	tmpPageID := idgen.NextId()
	if result.Total > 0 {
		if options.PageNum == 1 {
			// 缓存查询成功的条件，用于导出
			if err := r.quakeRepo.CreateQueryField(&models.QuakeRealtimeQueryLog{
				Query:       options.Query,
				Rule:        options.Rule,
				IpList:      options.IpList,
				Page:        options.PageNum,
				PageSize:    options.PageSize,
				IgnoreCache: options.IgnoreCache,
				StartTime:   options.StartTime,
				EndTime:     options.EndTime,
				Include:     options.Include,
				Exclude:     options.Exclude,
				Latest:      options.Latest,
			}, tmpPageID); err != nil {
				r.app.Logger.Warn(err)
			}
		}
		r.cacheTotal.Add(tmpPageID, result.Total, options.Query)
		if err := r.quakeRepo.CreateBulk(tmpPageID, result.Items); err != nil {
			r.app.Logger.Warn(err)
		}
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
	queryResult.PageID = tmpPageID
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) RealtimeServiceDataExport(pageID int64, pageNum, pageSize int) (int64, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID":   pageID,
		"pageNum":  pageNum,
		"pageSize": pageSize,
	}).Debug("传入参数")
	queryLog, err := r.quakeRepo.GetQueryFieldByTaskID(pageID)
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	r.app.Logger.Info(queryLog)
	exportID, outputAbsFilepath, err := r.exportLogBridge.Create("Quake")
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		for index := 1; index <= pageNum; index++ {
			result, err1 := backoff.RetryWithData(func() (*RealtimeServiceDataResult, error) {
				req := NewRealtimeServiceReqBuilder().
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
					Rule(queryLog.Rule)
				result, err2 := r.quake.RealtimeServer.Service(req)
				if err2 != nil {
					r.app.Logger.Error(err2)
					return nil, err2
				}
				return result, nil
			}, service2.GetBackOffWithMaxRetries(10, r.app.Config.Quake.Interval, 1))
			if err1 != nil {
				r.app.Logger.Error(err1)
				break
			}
			if err2 := r.quakeRepo.CreateBulk(exportID, result.Items); err2 != nil {
				r.app.Logger.Error(err2)
			}
			time.Sleep(r.app.Config.Quake.Interval)
		}
		cacheItems, err2 := r.quakeRepo.GetBulkByPageID(exportID)
		if err2 != nil {
			r.app.Logger.Error(err2)
			data := event.EventDetail{
				ID:     exportID,
				Status: status.Error,
				Error:  err.Error(),
			}
			r.app.Logger.Error(err, data)
			event.EmitNewExportItemEvent(event.QuakeExport, data)
			return
		}
		exportItems := make([]*quakeModel.RealtimeServiceItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.RealtimeServiceItem)
		}
		service2.SaveToExcel(nil, nil, exportID, event.QuakeExport, r.app.Logger, func() error {
			return r.quake.Export(exportItems, outputAbsFilepath)
		})
	}()
	return exportID, nil
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
//	if options.PageNum <= 0 {
//		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(client.ErrorQueryPage))
//	}
//	req := quakeCient.NewRealtimeServiceReqBuilder().
//		Query(options.Query).
//		PageNum(options.PageNum).
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
//		cacheItem.PageNum = int(math.Ceil(float64(result.Total) / float64(options.Size)))
//		initialize.QueryCache.Set(uuid, cacheItem, initialize.DefaultCacheTimeout)
//		responseWithUUID.UUID = uuid
//		responseWithUUID.MaxPage = cacheItem.PageNum
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
