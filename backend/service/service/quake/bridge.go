package quake

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/logger"
	quakeModel "fine/backend/service/model/quake"
	service2 "fine/backend/service/service"
	"fine/backend/utils"
	"github.com/cenkalti/backoff/v4"

	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"time"
)

type Bridge struct {
	app         *app.App
	quake       *Quake
	quakeRepo   repository.QuakeRepository
	downloadLog *repository.DownloadLogService
	token       *repository.HunterRestTokenDBService
	cacheTotal  *repository.CacheTotal
	historyRepo repository.HistoryRepository
}

func NewQuakeBridge(app *app.App) *Bridge {
	t := config.GlobalConfig.Quake
	tt := NewClient(t.Token)
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		quake:       tt,
		quakeRepo:   repository.NewQuakeRepository(database.GetConnection()),
		downloadLog: repository.NewDownloadLogService(),
		cacheTotal:  repository.NewCacheTotal(),
		app:         app,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

func (r *Bridge) SetAuth(key string) error {
	config.GlobalConfig.Quake.Token = key
	if err := config.Save(); err != nil {
		logger.Info(err.Error())
		return err

	}
	r.quake.SetAuth(key)
	return nil
}

type RealtimeServiceQueryResult struct {
	Result  RealtimeServiceDataResult `json:"result"`
	TaskID  int64                     `json:"taskID"`
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

func (r *Bridge) GetUserInfo() (*User, error) {
	user, err := r.quake.User()
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return user, nil
}

func (r *Bridge) RealtimeServiceDataQuery(taskID int64, options RealtimeDataQueryOptions) (*RealtimeServiceQueryResult, error) {
	queryResult := &RealtimeServiceQueryResult{
		Result: RealtimeServiceDataResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.quakeRepo.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = options.PageNum
		queryResult.Result.PageSize = options.PageSize
		queryResult.TaskID = taskID
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.RealtimeServiceItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  options.Query,
		Type: constant.Histories.Quake,
	})
	if err != nil {
		logger.Info(err)
	}

	req := NewGetRealtimeDataBuilder().
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
		Rule(options.Rule).
		Build()
	result, err := r.quake.RealtimeServer.Service(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if options.PageNum == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.quakeRepo.CreateQueryField(&models.QuakeRealtimeQueryLog{
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
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, options.Query)
		_ = r.quakeRepo.CreateBulk(id, result.Items)
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

func (r *Bridge) RealtimeServiceDataExport(taskID int64, page, pageSize int) error {
	queryLog, err := r.quakeRepo.GetQueryFieldByTaskID(taskID)
	if err != nil {
		logger.Info(err.Error())
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("Quake_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)

	go func() {
		exportDataTaskID := idgen.NextId()
		for index := 1; index <= page; index++ {
			result, err := backoff.RetryWithData(func() (*RealtimeServiceDataResult, error) {
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
				result, err := r.quake.RealtimeServer.Service(req)
				if err != nil {
					logger.Info(err.Error())
					return nil, err
				}
				return result, nil
			}, service2.GetBackOffWithMaxRetries(10, config.GlobalConfig.Quake.Interval, 1))

			if err != nil {
				logger.Info(err.Error())
				break
			}
			_ = r.quakeRepo.CreateBulk(exportDataTaskID, result.Items)
			time.Sleep(config.GlobalConfig.Quake.Interval)
		}
		cacheItems, err := r.quakeRepo.GetBulkByTaskID(exportDataTaskID)
		if err != nil {
			logger.Info(err.Error())
			return
		}
		exportItems := make([]quakeModel.RealtimeServiceItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, *cacheItem.RealtimeServiceItem)
		}
		if err := r.quake.Export(exportItems, outputAbsFilepath); err != nil {
			logger.Info(err.Error())
			return
		}
		constant.HasNewDownloadLogItemEventEmit(constant.Events.HasNewQuakeDownloadItem)
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
