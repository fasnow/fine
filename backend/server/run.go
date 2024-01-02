package server

import (
	config2 "fine-server/config"
	"fine-server/server/httpoutput"
	"fine-server/server/initialize"
	"fine-server/server/routes"
	"fine-server/server/routes/0zone"
	"fine-server/server/routes/batchhttp"
	"fine-server/server/routes/fofa"
	"fine-server/server/routes/hunter"
	"fine-server/server/routes/icp"
	"fine-server/server/routes/ip138"
	"fine-server/server/routes/quake"
	"fine-server/server/routes/tianyancha"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
)

var bind string
var dataPath string

type Option func(e *gin.Engine) error

func Bind(addr string) Option {
	return func(e *gin.Engine) error {
		bind = addr
		return nil
	}
}

func DataPath(path string) Option {
	return func(e *gin.Engine) error {
		dataPath = path
		return nil
	}
}

func Run(opts ...Option) error {
	e := gin.Default()
	initRoute(e)
	for _, opt := range opts {
		err := opt(e)
		if err != nil {
			return err
		}
	}
	if err := initialize.Init(dataPath); err != nil {
		return err
	}
	var addr = "localhost:9321"
	if bind != "" {
		addr = bind
	}
	if err := e.Run(addr); err != nil {
		return err
	}
	return nil
}

// 解决跨域问题
func allowCors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type") //header的类型
		//c.Header("Access-Control-Allow-Methods", "post, GET, OPTIONS")
		c.Header("content-type", "application/json")

		//c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization, Token")

		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		c.Next()
	}
}

func authMiddleware(pluginName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !config2.CheckAuth(pluginName) {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyAuth))
			c.Abort()
			return
		}
		c.Next()
	}
}

func exportDataParamsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var id = c.Query("id")
		if strings.TrimSpace(id) == "" {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyUUID))
			c.Abort()
			return
		}
		var page, err = strconv.Atoi(c.Query("page"))
		if err != nil || page < 0 {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorExportPage))
			c.Abort()
			return
		}
		c.Next()
	}
}

func exportStatusDataParamsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var id = c.Query("id")
		if strings.TrimSpace(id) == "" {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(routes.ErrorEmptyUUID))
			c.Abort()
			return
		}
		c.Next()
	}
}

func initRoute(route *gin.Engine) {
	route.Use(allowCors()) //解决跨域问题
	// 设置 Content Security Policy 头部
	//route.Use(func(c *gin.Context) {
	//	c.Header("Content-Security-Policy", "default-src 'self' http://127.0.0.1:9322")
	//	c.Next()
	//}) //CSP
	apiGroup := route.Group("/api")
	apiGroup.GET("", func(context *gin.Context) {
		rs := route.Routes()
		var s []string
		for _, route := range rs {
			s = append(s, route.Method+"  "+route.Path)
		}
		httpoutput.HttpStdOutput(context, s)
	})
	apiGroup.GET("/checkUpdate", routes.CheckUpdate)
	downloadLogGroup := apiGroup.Group("/downloadLog")
	{
		downloadLogGroup.GET("", routes.DownloadLog)
	}

	configGroup := apiGroup.Group("/config")
	{
		configGroup.GET("", routes.GetAllConf)
		configGroup.GET("/proxy", routes.GetProxyConf)
		configGroup.GET("/fofa", fofa.GetFofaConf)
		configGroup.GET("/hunter", hunter.GetHunterConf)
		configGroup.GET("/0.zone", _zone.Get0zoneConf)
		configGroup.GET("/quake", quake.GetQuakeConf)
		configGroup.GET("/other", routes.GetOtherConf)
		configGroup.POST("/proxy", routes.SaveProxyConf)
		configGroup.POST("/fofa", fofa.SaveFofaConf)
		configGroup.POST("/hunter", hunter.SaveHunterConf)
		configGroup.POST("/0.zone", _zone.Save0zoneConf)
		configGroup.POST("/quake", quake.SaveQuakeConf)
		configGroup.POST("/other", routes.SaveOtherConf)
	}
	userGroup := apiGroup.Group("/user")
	{
		userGroup.GET("/fofa", fofa.FofaUser)
		userGroup.GET("/quake", quake.QuakeUser)
	}
	queryGroup := apiGroup.Group("/query")
	{
		queryGroup.GET("/batchHttp", batchhttp.BatchHttp)
		queryGroup.GET("/externalIp", routes.ExternalIp)
		queryGroup.GET("/aggregate/step1", routes.AggregateStep1) //查询条数
		queryGroup.GET("/aggregate/step2", routes.AggregateStep2) //设置每个平台查询条数及执行查询

		queryGroup.POST("/icpRecord", icp.Query)
		queryGroup.GET("/icpRecord/getImage", icp.GetImage)
		queryGroup.GET("/icpRecord/checkImage", icp.CheckImage)
		queryGroup.GET("/icpRecord/isSignExpired", icp.IsSignExpired)
		queryGroup.GET("/ip138/ip2Domains", ip138.Ip138GetIpCurrentDomain)
		queryGroup.GET("/ip138/domain2HistoryIps", ip138.Ip138GetDomainHistoryIp)
		queryGroup.GET("/ip138/domain2Ips", ip138.Ip138GetDomainCurrentIp)
		//queryGroup.GET("/ip138/batchIp2Domains", routes.Ip138BatchIp2Domain)
		//queryGroup.GET("/ip138/batchDomain2Ips", routes.Ip138BatchDomain2Ip)
		queryGroup.POST("/fofa", authMiddleware(config2.FofaName), fofa.FofaQuery)
		queryGroup.POST("/hunter", authMiddleware(config2.HunterName), hunter.HunterQuery)

		query0zoneGroup := queryGroup.Group("/0.zone", authMiddleware(config2.ZoneName))
		{
			query0zoneGroup.POST("/site", _zone.ZoneSiteQuery)
			query0zoneGroup.POST("/domain", _zone.ZoneDomainQuery)
			query0zoneGroup.POST("/apk", _zone.ZoneApkQuery)
			query0zoneGroup.POST("/email", _zone.ZoneEmailQuery)
			query0zoneGroup.POST("/member", _zone.ZoneMemberQuery)
			query0zoneGroup.POST("/code", _zone.ZoneCodeQuery)
			query0zoneGroup.POST("/darknet", _zone.ZoneDarknetQuery)
			query0zoneGroup.POST("/aim", _zone.ZoneAimQuery)
		}

		queryQuakeGroup := queryGroup.Group("/quake", authMiddleware(config2.ZoneName))
		{

			queryQuakeGroup.POST("/realtime/service", quake.QuakeRealtimeServiceDataQuery)
			queryQuakeGroup.POST("/realtime/host", quake.QuakeRealtimeHostDataQuery)
			queryQuakeGroup.POST("/deep/service", quake.QuakeDeepServiceDataQuery)
			queryQuakeGroup.POST("/deep/host", quake.QuakeDeepHostDataQuery)
			queryQuakeGroup.GET("/field", quake.QuakeFieldFilterQuery)
		}

		queryGroup.POST("/zoomeye")
		queryGroup.POST("/shodan")
		//queryGroup.POST("/aiZhanSubdomain", routes.AiZhanSubdomainQuery)
		tianYanChaGroup := queryGroup.Group("/tianYanCha", authMiddleware(config2.ZoneName))
		{
			tianYanChaGroup.GET("/suggest", tianyancha.Suggest)
			tianYanChaGroup.GET("/baseInfo", tianyancha.GetBaseInfo)
			tianYanChaGroup.GET("/subsidiary", tianyancha.GetSubsidiary)
			tianYanChaGroup.GET("/shareholder", tianyancha.GetShareholder)
			tianYanChaGroup.GET("/investment", tianyancha.GetInvestment)
			tianYanChaGroup.GET("/weibo", tianyancha.GetWeibo)
			tianYanChaGroup.GET("/wechat", tianyancha.GetWechat)
			tianYanChaGroup.GET("/app", tianyancha.GetApp)
			tianYanChaGroup.GET("/supplier", tianyancha.GetSupplier)
		}
	}
	exportGroup := apiGroup.Group("/export", exportDataParamsMiddleware())
	{
		exportGroup.GET("/icpRecord", icp.Export)
		exportGroup.GET("/fofa", authMiddleware(config2.FofaName), fofa.FofaExport)
		exportGroup.GET("/hunter", authMiddleware(config2.HunterName), hunter.HunterExport)

		export0zoneGroup := exportGroup.Group("/0.zone", authMiddleware(config2.ZoneName))
		{
			export0zoneGroup.GET("/site", _zone.ZoneSiteDataExport)
			export0zoneGroup.GET("/domain", _zone.ZoneDomainDataExport)
			export0zoneGroup.GET("/apk", _zone.ZoneApkDataExport)
			export0zoneGroup.GET("/email", _zone.ZoneEmailDataExport)
			export0zoneGroup.GET("/member", _zone.ZoneMemberDataExport)
			export0zoneGroup.GET("/code", _zone.ZoneCodeDataExport)
			export0zoneGroup.GET("/darknet", _zone.ZoneDarknetDataExport)
			export0zoneGroup.GET("/aim", _zone.ZoneAIMDataExport)
		}

		exportQuakeGroup := exportGroup.Group("/quake", authMiddleware(config2.QuakeName))
		{
			exportQuakeGroup.GET("/realtime/service", quake.QuakeRealtimeServiceDataExport)
			exportQuakeGroup.GET("/realtime/host", quake.QuakeRealtimeServiceDataExport)
			exportQuakeGroup.GET("/deep/service", quake.QuakeRealtimeServiceDataExport)
			exportQuakeGroup.GET("/deep/host", quake.QuakeRealtimeServiceDataExport)

		}

	}

	exportStatusGroup := apiGroup.Group("/exportStatus", exportStatusDataParamsMiddleware())
	{
		exportStatusGroup.GET("/fofa", fofa.FofaExportStatus)
		exportStatusGroup.GET("/hunter", hunter.HunterExportStatus)
		exportStatusGroup.GET("/0.zone", _zone.ZoneDataExportStatus)
		exportStatusGroup.GET("/quake", quake.QuakeExportStatus)
	}
}
