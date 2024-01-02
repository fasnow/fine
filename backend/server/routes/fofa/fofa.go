package fofa

import (
	"errors"
	config2 "fine-server/config"
	"fine-server/sdk"
	fofa2 "fine-server/sdk/fofa"
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

func FofaUser(c *gin.Context) {
	userInfo, err := initialize.FofaClient.User()
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, *userInfo)
}

func FofaQuery(c *gin.Context) {
	var options routes.FofaQueryOptions
	var cacheItem routes.FofaExportCacheItem
	var responseWithUUID struct {
		*fofa2.Result
		MaxPage int    `json:"maxPage"`
		UUID    string `json:"id"`
	}
	if err := c.ShouldBind(&options); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	if options.Size <= 0 {
		options.Size = sdk.FofaDefaultPageSize
	}
	req := fofa2.NewGetDataReqBuilder().
		Query(options.Query).
		Page(options.Page).
		Size(options.Size).Fields(options.Fields).Full(options.Full).Build()
	result, err := initialize.FofaClient.Get(req)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeFofaQueryError, utils.FormatError(err))
		return
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cacheItem.Options = options
		//if result.Total > 10000 {
		//	cacheItem.Page = int(math.Floor(float64(10000) / float64(options.Size)))
		//} else {
		//	cacheItem.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		//}
		cacheItem.Total = result.Total
		cacheItem.Page = int(math.Ceil(float64(result.Total) / float64(options.Size)))
		cacheItem.Message = routes.Waiting
		initialize.QueryCache.Set(uuid, cacheItem, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cacheItem.Page
	}
	responseWithUUID.Result = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func FofaExport(c *gin.Context) {
	var id = c.Query("id")
	var page, _ = strconv.Atoi(c.Query("page"))
	var size, err = strconv.Atoi(c.Query("size"))
	if err != nil || size < 0 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportSize))
		return
	}
	var cache routes.FofaExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.FofaExportCacheItem); !ok {
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
		var resultItems []*fofa2.Item
		for index := 1; index <= page; index++ {
			req := fofa2.NewGetDataReqBuilder().Query(cache.Options.Query).
				Page(index).
				Size(size).
				Fields(cache.Options.Fields).
				Full(cache.Options.Full).
				Build()
			result, err2 := initialize.FofaClient.Get(req)
			if err2 != nil {
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
				time.Sleep(time.Duration(cfg.Interval.Fofa) * time.Millisecond)
				continue
			}
			resultItems = append(resultItems, result.Items...)
			time.Sleep(time.Duration(cfg.Interval.Fofa) * time.Millisecond)
		}
		filename := fmt.Sprintf("Fofa_%s.xlsx", utils.GenTimestamp())
		outputFilepath := filepath.Join(config2.GetDataBaseDir(), filename)
		if err2 := fofa2.Export(resultItems, outputFilepath); err2 != nil {
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

func FofaExportStatus(c *gin.Context) {
	var id = c.Query("id")
	var cache routes.FofaExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		if cache, ok = val.(routes.FofaExportCacheItem); !ok {
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

func GetFofaConf(c *gin.Context) {
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, initialize.GetConfig().Auth.Fofa)
}

func SaveFofaConf(c *gin.Context) {
	var conf config2.Fofa
	if err := c.ShouldBind(&conf); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	conf.Email = strings.TrimSpace(conf.Email)
	conf.Key = strings.TrimSpace(conf.Key)
	var cfg = initialize.GetConfig()
	cfg.Auth.Fofa = conf
	err := config2.SaveConf(cfg)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("Fofa认证配置失败:"+err.Error())))
		return
	}
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, conf)
}
