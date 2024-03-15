package quake

import (
	"github.com/fasnow/ghttp"
)

const (
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

type realtimeData struct {
	client *Quake
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
	key      string
	http     *ghttp.Client
	Realtime *realtimeData
	DeepData *deepData
	Field    *filterField
}

func NewClient(key string) *Quake {
	client := &Quake{
		key:      key,
		http:     &ghttp.Client{},
		Realtime: &realtimeData{},
		DeepData: &deepData{},
		Field:    &filterField{},
	}
	client.Realtime.client = client
	client.DeepData.client = client
	client.Field.client = client
	return client
}
func (q *Quake) SetAuth(key string) {
	q.key = key
}
