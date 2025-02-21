package quake

import (
	"errors"
	"fine/backend/proxy/v2"
	"net/http"
)

const (
	// QuakeUserApiUrl 获取Quake用户详情
	QuakeUserApiUrl = "https://quake.360.net/api/v3/user/info"
	// QuakeServiceDataFilterFieldApiUrl 获取服务数据筛选字段
	QuakeServiceDataFilterFieldApiUrl = "https://quake.360.net/api/v3/filterable/field/quake_service"
	// QuakeRealTimeServiceDataApi 服务数据实时查询
	QuakeRealTimeServiceDataApi = "https://quake.360.net/api/v3/search/quake_service"
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
)

type QueryType string

const (
	Service            QueryType = "service" //1
	Host                         = "host"
	AggregationService           = "aggregationService"
	AggregationHost              = "aggregationHost"
	DeepService                  = "deepService"
	DeepHost                     = "deepHost"
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

type realtimeService struct {
	client *Quake
}

type aggregationService struct {
	client           *Quake   `json:"client"`
	query            string   `json:"query"`            // 是	*	查询语句（支持的字段为获取聚合数据筛选字段接口返回的字段）
	rule             string   `json:"rule"`             // 否	无	类型为IP列表的服务数据收藏名称
	ip_list          []string `json:"ip_List"`          // 否	无	IP列表
	size             int      `json:"size"`             // 否	5	每项聚合数据的个数，聚合数量越大，请求响应时间越长，最大聚合数量1w
	ignore_cache     bool     `json:"ignore_cache"`     // 否	false	是否忽略缓存
	aggregation_list []string `json:"aggregation_list"` // 是	无	需要获取的聚合名称列表 [注：最多仅支持聚合两个字段]
	start_time       string   `json:"start_time"`       // 否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
	end_time         string   `json:"end_time"`         // 否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
	latest           bool     `json:"latest"`           // 否	false	是否使用最新数据
}

func (r *aggregationService) Query(query string) *error {
	r.query = query
	return nil
}

func (r *aggregationService) Rule(rule string) *aggregationService {
	r.rule = rule
	return r
}

func (r *aggregationService) IPList(ipList []string) *aggregationService {
	r.ip_list = ipList
	return r
}

func (r *aggregationService) Size(size int) *aggregationService {
	r.size = size
	return r
}

func (r *aggregationService) IgnoreCache(ignoreCache bool) *aggregationService {
	r.ignore_cache = ignoreCache
	return r
}

func (r *aggregationService) AggregationList(aggregationList []string) *aggregationService {
	r.aggregation_list = aggregationList
	return r
}

func (r *aggregationService) StartTime(startTime string) *aggregationService {
	r.start_time = startTime
	return r
}

func (r *aggregationService) EndTime(endTime string) *aggregationService {
	r.end_time = endTime
	return r
}

func (r *aggregationService) Latest(latest bool) *aggregationService {
	r.latest = latest
	return r
}

type deepData struct {
	client *Quake
}

type aggregationData struct {
	client *Quake
}

type faviconSimilarityData struct {
	client *Quake
}

type filterField struct {
	client *Quake
}

type Quake struct {
	key            string
	http           *http.Client
	RealtimeServer *realtimeService
	DeepData       *deepData
	Field          *filterField
}

func NewClient(key string) *Quake {
	client := &Quake{
		key:            key,
		http:           &http.Client{},
		RealtimeServer: &realtimeService{},
		DeepData:       &deepData{},
		Field:          &filterField{},
	}
	client.RealtimeServer.client = client
	client.DeepData.client = client
	client.Field.client = client
	return client
}

func (r *Quake) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func (r *Quake) SetAuth(key string) {
	r.key = key
}
