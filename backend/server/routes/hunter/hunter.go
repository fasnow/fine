package hunter

import (
	"errors"
	config2 "fine-server/config"
	"fine-server/sdk"
	hunter2 "fine-server/sdk/hunter"
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

func HunterQuery(c *gin.Context) {
	var options routes.HunterQueryOptions
	var cacheItem routes.HunterExportCacheItem
	var responseWithUUID struct {
		*hunter2.Result
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
	req := hunter2.NewGetDataReqBuilder().
		Query(options.Query).
		Page(options.Page).
		Size(options.Size).
		StartTime(options.StartTime).
		EndTime(options.EndTime).
		StatusCode(options.StatusCode).
		IsWeb(options.IsWeb).
		PortFilter(options.PortFilter).Build()
	result, err := initialize.HunterClient.Get(req)
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
	for i := 0; i < len(result.Data); i++ {
		var location []string
		item := &result.Data[i]
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
	responseWithUUID.Result = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func HunterExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var size, err = strconv.Atoi(c.Query("size"))
	if err != nil || size < 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportSize))
		return
	}
	var cache routes.HunterExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.HunterExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}
	//if page > cache.Page {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(ErrorExportPage))
	//	return
	//}
	if int(math.Ceil(float64(cache.Total)/float64(size))) < page {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
		return
	}
	cache.Message = routes.Exporting
	initialize.QueryCache.Update(id, cache)
	go func() {
		var cfg = initialize.GetConfig()
		var retry = 3
		var resultItems []*hunter2.Item
		for index := 1; index <= page; index++ {
			req := hunter2.NewGetDataReqBuilder().
				Query(cache.Options.Query).
				Page(index).
				Size(size).
				StartTime(cache.Options.StartTime).
				EndTime(cache.Options.EndTime).
				StatusCode(cache.Options.StatusCode).
				IsWeb(cache.Options.IsWeb).
				PortFilter(cache.Options.PortFilter).Build()
			result, err := initialize.HunterClient.Get(req)
			if err != nil {
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					if len(resultItems) == 0 {
						httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(time.Duration(cfg.Interval.Hunter) * time.Millisecond)
				continue
			}
			resultItems = append(resultItems, result.Data...)
			time.Sleep(time.Duration(cfg.Interval.Hunter) * time.Millisecond)
		}
		filename := fmt.Sprintf("Hunter_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err2 := hunter2.Export(resultItems, outputFilepath); err2 != nil {
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

func HunterExportStatus(c *gin.Context) {
	var id = c.Query("id")
	var cache routes.HunterExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		if cache, ok = val.(routes.HunterExportCacheItem); !ok {
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

func GetHunterConf(c *gin.Context) {
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, initialize.GetConfig().Auth.Hunter)
}
func SaveHunterConf(c *gin.Context) {
	var conf config2.Hunter
	if err := c.ShouldBind(&conf); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	conf.Key = strings.TrimSpace(conf.Key)
	//if conf.Key == "" {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(errors.New("incorrect key")))
	//	return
	//}
	var cfg = initialize.GetConfig()
	cfg.Auth.Hunter = conf
	err := config2.SaveConf(cfg)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("Hunter认证配置失败:"+err.Error())))
		return
	}
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, conf)
}
