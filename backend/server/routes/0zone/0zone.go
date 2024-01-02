package _zone

import (
	"errors"
	config2 "fine-server/config"
	zone2 "fine-server/sdk/zone"
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

func Get0zoneConf(c *gin.Context) {
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, initialize.GetConfig().Auth.Zone)
}

func Save0zoneConf(c *gin.Context) {
	var conf config2.Zone
	if err := c.ShouldBind(&conf); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	conf.Key = strings.TrimSpace(conf.Key)
	var cfg = initialize.GetConfig()
	cfg.Auth.Zone = conf
	if err := config2.SaveConf(cfg); err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("0.zone认证配置失败:"+err.Error())))
		return
	}
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, conf)
}

func ZoneSiteQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Site.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.SiteResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.SiteType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.SiteResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneDomainQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Domain.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.DomainResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.DomainType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.DomainResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneApkQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Apk.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.ApkResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.ApkType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.ApkResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneEmailQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Email.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.EmailResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.EmailType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.EmailResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneMemberQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Member.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.MemberResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.MemberType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.MemberResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneCodeQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Code.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.CodeResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.DarknetType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.CodeResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneDarknetQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().Query(options.Query).Page(options.Page).Size(options.Size).Build()
	result, err := initialize.ZoneClient.Darknet.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.DarknetResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.DarknetType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.DarknetResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneAimQuery(c *gin.Context) {
	var options routes.ZoneQueryOptions
	var cache routes.ZoneExportCacheItem
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	req := zone2.NewGetDataReqBuilder().
		Query(options.Query).
		Page(options.Page).
		Size(options.Size).
		MessageTimeASCSort(options.MessageTimeSort).
		TimestampASCSort(options.TimestampSort).
		Build()
	result, err := initialize.ZoneClient.AIM.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var responseWithUUID struct {
		*zone2.AimResult
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cache.Options = options
		cache.Options.QueryType = zone2.AIMType
		cache.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		initialize.QueryCache.Set(uuid, cache, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cache.Page
	}
	responseWithUUID.AimResult = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func ZoneDataExportStatus(c *gin.Context) {
	var id = c.Query("id")
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
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

func ZoneSiteDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if page > cache.Page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var siteDataItems []*zone2.SiteItem
		for index := 1; index <= page; index++ {
			req := zone2.NewGetDataReqBuilder().Query(cache.Options.Query).Page(index).Size(cache.Options.Size).Build()
			result, err := initialize.ZoneClient.Site.Get(req)
			if err != nil {
				if retry == 0 {
					httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
					return
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
				continue
			}
			siteDataItems = append(siteDataItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
		}
		filename := fmt.Sprintf("零零信安_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err := zone2.SiteDataExport(siteDataItems, outputFilepath); err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
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

func ZoneDomainDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if page > cache.Page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var domainDataItems []*zone2.DomainItem
		for index := 1; index <= page; index++ {
			req := zone2.NewGetDataReqBuilder().Query(cache.Options.Query).Page(index).Size(cache.Options.Size).Build()
			result, err := initialize.ZoneClient.Domain.Get(req)
			if err != nil {
				if retry == 0 {
					httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
					return
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
				continue
			}
			domainDataItems = append(domainDataItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
		}
		filename := fmt.Sprintf("零零信安_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err := zone2.DomainDataExport(domainDataItems, outputFilepath); err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
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

func ZoneApkDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if page > cache.Page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var apkDataItems []*zone2.ApkItem
		for index := 1; index <= page; index++ {
			req := zone2.NewGetDataReqBuilder().Query(cache.Options.Query).Page(index).Size(cache.Options.Size).Build()
			result, err := initialize.ZoneClient.Apk.Get(req)
			if err != nil {
				if retry == 0 {
					httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
					return
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
				continue
			}
			apkDataItems = append(apkDataItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
		}
		filename := fmt.Sprintf("零零信安_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err := zone2.ApkDataExport(apkDataItems, outputFilepath); err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
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

func ZoneEmailDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if page > cache.Page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var emailDataItems []*zone2.EmailItem
		for index := 1; index <= page; index++ {
			req := zone2.NewGetDataReqBuilder().Query(cache.Options.Query).Page(index).Size(cache.Options.Size).Build()
			result, err := initialize.ZoneClient.Email.Get(req)
			if err != nil {
				if retry == 0 {
					httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
					return
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
				continue
			}
			emailDataItems = append(emailDataItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
		}
		filename := fmt.Sprintf("零零信安_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err := zone2.EmailDataExport(emailDataItems, outputFilepath); err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
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

func ZoneMemberDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if page > cache.Page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var memberDataItems []*zone2.MemberItem
		for index := 1; index <= page; index++ {
			req := zone2.NewGetDataReqBuilder().Query(cache.Options.Query).Page(index).Size(cache.Options.Size).Build()
			result, err := initialize.ZoneClient.Member.Get(req)
			if err != nil {
				if retry == 0 {
					httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
					return
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
				continue
			}
			memberDataItems = append(memberDataItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
		}
		filename := fmt.Sprintf("零零信安_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err := zone2.MemberDataExport(memberDataItems, outputFilepath); err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
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

func ZoneCodeDataExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var cache routes.ZoneExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.ZoneExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	if page > cache.Page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var codeDataItems []*zone2.CodeItem
		for index := 1; index <= page; index++ {
			req := zone2.NewGetDataReqBuilder().Query(cache.Options.Query).Page(index).Size(cache.Options.Size).Build()
			result, err := initialize.ZoneClient.Code.Get(req)
			if err != nil {
				if retry == 0 {
					httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
					return
				}
				retry--
				index--
				time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
				continue
			}
			codeDataItems = append(codeDataItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Zone) * time.Millisecond)
		}
		filename := fmt.Sprintf("零零信安_%s.zip", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err := zone2.CodeDataExport(codeDataItems, outputFilepath); err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
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

func ZoneDarknetDataExport(c *gin.Context) {}

func ZoneAIMDataExport(c *gin.Context) {}
