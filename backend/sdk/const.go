package sdk

import (
	"errors"
)

const (
	FofaDefaultPageSize   = 200
	HunterDefaultPageSize = 20
	ZoneDefaultPageSize   = 40
	QuakeDefaultPageSize  = 20
)
const (
	WrongJsonFormat                   = "looking for beginning of value"
	QuakeUnexpectedJsonResponse       = "unexpected json response"
	QuakeInvalidKey                   = "invalid key"
	QuakeUnauthorized                 = "/quake/login"
	UnexpectedResponse                = "unexpected response"
	QuakeUnexpectedJsonResponseOfUser = "unexpected user structure"
)

var (
	UnexpectedStructureError      = errors.New("服务端返回非预期数据")
	UnexpectedQueryTypeError      = errors.New("unexpected query type")
	UnexpectedQueryStatementError = errors.New("unexpected query statement")
	UnexpectedFieldTypeError      = errors.New("unexpected field type")
	ErrorQueryStatement           = errors.New("查询语句不能为空")
	ErrorQueryPage                = errors.New("页码必须大于0")
	ErrorQuerySize                = errors.New("分页大小必须大于0")
	NonStatusOK                   = errors.New("服务端返回非200响应码")
)

const (
	// FofaApiUrl fofa api
	FofaApiUrl = "https://fofa.info/api/v1/search/all"
	// FofaUserApiUrl user api
	FofaUserApiUrl = "https://fofa.info/api/v1/info/my"
	// HunterApiUrl 鹰图api
	HunterApiUrl = "https://hunter.qianxin.com/openApi/search"
	// ZoneApiUrl 零零信安api
	ZoneApiUrl = "https://0.zone/api/data/"
	// QuakeUserApiUrl 获取Quake用户详情
	QuakeUserApiUrl = "https://quake.360.net/api/v3/user/info"
	// QuakeServiceDataFilterFieldApiUrl 获取服务数据筛选字段
	QuakeServiceDataFilterFieldApiUrl = "https://quake.360.net/api/v3/filterable/field/quake_service"
	// QuakeRealTimeServiceDataApiUrl 服务数据实时查询
	QuakeRealTimeServiceDataApiUrl = "https://quake.360.net/api/v3/search/quake_service"
	// QuakeDeepServiceDataApiUrl 服务数据深度查询
	QuakeDeepServiceDataApiUrl = "https://quake.360.net/api/v3/scroll/quake_service"
	// QuakeAggregationServiceDataApiUrl 获取聚合数据筛选字段 聚合信息查询
	QuakeAggregationServiceDataApiUrl = "https://quake.360.net/api/v3/aggregation/quake_service"
	// QuakeHostDataFilterFieldApiUrl 获取主机数据筛选字段
	QuakeHostDataFilterFieldApiUrl = "https://quake.360.net/api/v3/filterable/field/quake_host"
	// QuakeRealTimeHostDataApiUrl 主机数据实时查询
	QuakeRealTimeHostDataApiUrl = "https://quake.360.net/api/v3/search/quake_host"
	// QuakeDeepHostDataApiUrl 主机数据深度查询
	QuakeDeepHostDataApiUrl = "https://quake.360.net/api/v3/scroll/quake_host"
	// QuakeAggregationHostDataApiUrl 获取聚合数据筛选字段 聚合数据查询
	QuakeAggregationHostDataApiUrl = "https://quake.360.net/api/v3/aggregation/quake_host"
	// QuakeFaviconSimilarityDataApiUrl favicon相似度查询接口
	QuakeFaviconSimilarityDataApiUrl = "https://quake.360.net/api/v3/query/similar_icon/aggregation"

	ExternalIpApiUrl = "https://ifconfig.me/all.json"

	chaZiYuSubdomainQueryApiUrl = "https://chaziyu.com/"

	// https://site.ip138.com/baidu.com/
	Ip138BaseURL = "https://site.ip138.com/"

	// https://site.ip138.com/domain/read.do?domain=baidu.com
	Ip138BaseReadURL = "https://site.ip138.com/domain/read.do"

	// https://site.ip138.com/domain/write.do?type=domain&input=baidu.com&token=b38c4d8e0f2cc338ffbaabf1042fc30f
	Ip138BaseWriteURL = "https://site.ip138.com/domain/write.do"
	//https://api.ip138.com/query/?ip=104.21.53.119&oid=5&mid=5&from=siteFront&datatype=json&sign=e42751019ebb86b656608094f965b2b4
	Ip138BaseLocateURL = "https://api.ip138.com/query/"
)
