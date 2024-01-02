package icp

import (
	"fine-server/config"
	"fine-server/sdk/icp"
	"fine-server/server/httpoutput"
	"fine-server/server/initialize"
	"fine-server/server/routes"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"math"
	"path/filepath"
)

func Query(c *gin.Context) {
	var body struct {
		Query string `json:"query"` //needed
		Page  int    `json:"page"`  //needed
		Size  int    `json:"size"`  //needed
	}
	var cacheItem routes.IcpExportCacheItem
	var responseWithUUID struct {
		*icp.Result
		UUID    string `json:"id"`
		MaxPage int    `json:"maxPage"`
	}
	if err := c.ShouldBind(&body); err != nil && err.Error() != routes.NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	result, err := initialize.IcpRecordClient.Page(body.Page).PageSize(body.Size).Query(body.Query)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeIcpQueryError, utils.FormatError(err))
		return
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		uuid := initialize.QueryCache.GenerateUUID()
		cacheItem.Page = int(math.Ceil(float64(result.Total) / float64(body.Size)))
		cacheItem.Size = body.Size
		cacheItem.UnitName = body.Query
		cacheItem.Total = result.Total
		initialize.QueryCache.Set(uuid, cacheItem, initialize.DefaultCacheTimeout)
		responseWithUUID.UUID = uuid
		responseWithUUID.MaxPage = cacheItem.Page
	}
	responseWithUUID.Result = result
	httpoutput.HttpStdOutput(c, responseWithUUID)
}

func Export(c *gin.Context) {
	var id = c.Query("id")
	var cache routes.IcpExportCacheItem
	if val, ok := initialize.QueryCache.Get(id); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cache, ok = val.(routes.IcpExportCacheItem); !ok {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
			return
		}
	} else {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyCache))
		return
	}

	//var resultItems []icp.Item
	//var retry = 3
	//for page := 1; page <= cache.Page; page++ {
	//	result, err := IcpRecordClient.Page(page).Size(cache.Size).Query(cache.UnitName)
	//	if err != nil {
	//		if retry == 0 {
	//			HttpErrOutput(c, CodeOtherError, utils.FormatError(err))
	//			return
	//		}
	//		page--
	//		retry--
	//		time.Sleep(time.Duration(config.Cfg.Interval.Fofa) * time.Millisecond)
	//		continue
	//	}
	//	resultItems = append(resultItems, result.Items...)
	//	time.Sleep(time.Duration(config.Cfg.Interval.Fofa) * time.Millisecond)
	//}
	result, err := initialize.IcpRecordClient.Page(1).PageSize(cache.Total).Query(cache.UnitName)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}

	var data [][]any
	headers := append([]any{"id"}, []any{"Domain", "Domain_ID",
		"Leader_Name", "Limit_Access", "Main_ID", "Main_Licence", "Nature_Name", "Service_ID", "Service_Licence",
		"Unit_Name", "UpdateRecord_Time"}...)
	data = append(data, headers)
	for i, item := range result.Items {
		var tmpItem = []any{
			i + 1,
			item.Domain,
			item.DomainID,
			item.LeaderName,
			item.LimitAccess,
			item.MainID,
			item.MainLicence,
			item.NatureName,
			item.ServiceID,
			item.ServiceLicence,
			item.UnitName,
			item.UpdateRecordTime}
		data = append(data, tmpItem)
	}

	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenTimestamp())
	outputFilepath := filepath.Join(config.GetDataBaseDir(), filename)
	if err := utils.SaveToExcel(data, outputFilepath); err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeFofaQueryError, utils.FormatError(err))
		return
	}
	config.AddDownloadLogItem(outputFilepath)
	routes.SendExcelFileToClient(c, outputFilepath)
}

func GetImage(c *gin.Context) {
	image, err := initialize.IcpRecordClient.GetImage()
	if err != nil {
		httpoutput.HttpErrOutput(c, 9999, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, image)
}

func IsSignExpired(c *gin.Context) {
	httpoutput.HttpStdOutput(c, initialize.IcpRecordClient.IsSignExpired())
}

func CheckImage(c *gin.Context) {
	var pointJson = c.Query("pointJson")
	sign, smallImage, err := initialize.IcpRecordClient.CheckImage(pointJson)
	if err != nil {
		httpoutput.HttpErrOutput(c, 9999, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, map[string]any{
		"sign":       sign,
		"smallImage": smallImage,
	})
}
