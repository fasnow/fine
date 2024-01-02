package quake

import (
	"errors"
	config2 "fine-server/config"
	"fine-server/sdk"
	quake2 "fine-server/sdk/quake"
	"fine-server/server/httpoutput"
	"fine-server/server/initialize"
	"fine-server/server/routes"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"math"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func QuakeUser(c *gin.Context) {
	userInfo, err := initialize.QuakeClient.User()
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, userInfo)
}

func SaveQuakeConf(c *gin.Context) {
	var conf config2.Quake
	if err := c.ShouldBind(&conf); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	conf.Key = strings.TrimSpace(conf.Key)
	//if conf.Key == "" {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(errors.New("key不正确")))
	//	return
	//}
	var cfg = initialize.GetConfig()
	cfg.Auth.Quake = conf
	err := config2.SaveConf(cfg)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("Quake认证配置失败:"+err.Error())))
		return
	}
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, conf)
}

func GetQuakeConf(c *gin.Context) {
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, initialize.GetConfig().Auth.Quake)
}

func QuakeFieldFilterQuery(c *gin.Context) {
	filedType := c.Query("type")
	var data []*string
	var err error
	switch filedType {
	case string(quake2.Service):
		data, err = initialize.QuakeClient.Field.Service()
		break
	case quake2.Host:
		data, err = initialize.QuakeClient.Field.Host()
		break
	case quake2.AggregationService:
		data, err = initialize.QuakeClient.Field.AggregationService()
		break
	case quake2.AggregationHost:
		data, err = initialize.QuakeClient.Field.AggregationHost()
		break
	default:
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(fmt.Errorf("查询类型错误")))
		return
	}
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, data)
}

func QuakeRealtimeServiceDataQuery(c *gin.Context) {
	var options routes.QuakeRealtimeDataQueryOptions
	var cacheItem routes.QuakeExportCacheItem
	var responseWithUUID struct {
		*quake2.RSDQueryResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	if options.Size <= 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(sdk.ErrorQuerySize))
	}
	if options.Page <= 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(sdk.ErrorQueryPage))
	}
	req := quake2.NewGetRealtimeDataBuilder().
		Query(options.Query).
		Page(options.Page).
		Size(options.Size).
		EndTime(options.EndTime).
		StartTime(options.StartTime).
		IpList(options.IpList).
		Include(options.Include).
		Exclude(options.Exclude).
		Latest(options.Latest).
		IgnoreCache(options.IgnoreCache).
		Rule(options.Rule).
		Build()
	result, err := initialize.QuakeClient.Realtime.Service(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cacheItem.QueryType = quake2.Service
		cacheItem.Options = options
		cacheItem.Total = result.Total
		cacheItem.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cacheItem, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cacheItem.Page
	}
	for i := 0; i < len(result.Data); i++ {
		var item = &result.Data[i]
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
	responseWithUUID.RSDQueryResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func QuakeRealtimeHostDataQuery(c *gin.Context) {
	var options routes.QuakeRealtimeDataQueryOptions
	var cacheItem routes.QuakeExportCacheItem
	var responseWithUUID struct {
		*quake2.RHDQueryResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	if options.Size <= 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(sdk.ErrorQuerySize))
	}
	if options.Page <= 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(sdk.ErrorQueryPage))
	}
	req := quake2.NewGetRealtimeDataBuilder().
		Query(options.Query).
		Page(options.Page).
		Size(options.Size).
		EndTime(options.EndTime).
		StartTime(options.StartTime).
		IpList(options.IpList).
		Include(options.Include).
		Exclude(options.Exclude).
		Latest(options.Latest).
		IgnoreCache(options.IgnoreCache).
		Rule(options.Rule).
		Build()
	result, err := initialize.QuakeClient.Realtime.Host(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cacheItem.Options = options
		cacheItem.Total = result.Total
		cacheItem.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cacheItem, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cacheItem.Page
	}
	responseWithUUID.RHDQueryResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func QuakeDeepServiceDataQuery(c *gin.Context) {
}

func QuakeDeepHostDataQuery(c *gin.Context) {
}

func QuakeAggregationServiceDataQuery(c *gin.Context) {
}

func QuakeAggregationHostDataQuery(c *gin.Context) {
}

func QuakeQueryAggregationData(c *gin.Context) {
}

func QueryFaviconSimilarityData(c *gin.Context) {
	//var body struct {
	//	FaviconHash string  `json:"faviconHash"`
	//	Similar     float64 `json:"similar"`
	//	Size        int     `json:"size"`
	//	IgnoreCache bool    `json:"ignoreCache"`
	//	StartTime   string  `json:"startTime"`
	//	EndTime     string  `json:"endTime"`
	//}
	//if err := c.ShouldBind(&body); err != nil && err.Error() != NoJsonKeyStringError {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(err))
	//	return
	//}
	//result, err := QuakeClient.QueryFaviconSimilarityData(body.FaviconHash, body.Similar, body.Size, body.IgnoreCache, body.StartTime, body.EndTime)
	//if err != nil {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(err))
	//	return
	//}
	//HttpStdOutput(c, result)
}

func QuakeRealtimeServiceDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var size, err = strconv.Atoi(c.Query("size"))
	if err != nil || size < 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportSize))
		return
	}
	var cache routes.QuakeExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.QuakeExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if int(math.Ceil(float64(cache.Total)/float64(size))) < page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var resultItems []*quake2.RealtimeServiceItem
		for index := 1; index <= page; index++ {
			req := quake2.NewGetRealtimeDataBuilder().
				Query(cache.Options.Query).
				Page(index).
				Size(size).
				EndTime(cache.Options.EndTime).
				StartTime(cache.Options.StartTime).
				IpList(cache.Options.IpList).
				Include(cache.Options.Include).
				Exclude(cache.Options.Exclude).
				Latest(cache.Options.Latest).
				IgnoreCache(cache.Options.IgnoreCache).
				Rule(cache.Options.Rule).
				Build()
			result, err := initialize.QuakeClient.Realtime.Service(req)
			if err != nil {
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					if len(resultItems) == 0 {
						httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
						return
					}
					break
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Quake) * time.Millisecond)
				continue
			}
			resultItems = append(resultItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Quake) * time.Millisecond)
		}
		filename := fmt.Sprintf("Quake%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err2 := quake2.Export(resultItems, outputFilepath); err2 != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err2))
			return
		}
		cache.Message = routes.Finished
		cache.Filename = filename
		initialize.QueryCache.Update(id, cache)
	}()
	httpoutput.HttpStdOutput(c, routes.ExportStatusResponse{
		Message: routes.Exporting,
	})
}

func QuakeExportStatus(c *gin.Context) {
	var id = c.Query("id")
	var cache routes.QuakeExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		if cache, ok = val.(routes.QuakeExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if cache.Message == routes.Finished {
		httpoutput.HttpStdOutput(c, routes.ExportStatusResponse{
			Message:  routes.Finished,
			Filename: cache.Filename,
		})
		config2.AddDownloadLogItem(cache.Filename)
		cache.Message = routes.Waiting
		cache.Filename = ""
		initialize.QueryCache.Update(id, cache)
	} else {
		httpoutput.HttpStdOutput(c, routes.ExportStatusResponse{
			Message: cache.Message,
		})
	}
}
