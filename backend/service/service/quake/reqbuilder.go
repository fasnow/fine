package quake

import (
	"fine/backend/service/service"
)

type Req[i interface{}] struct {
	HttpMethod  string
	ApiPath     string
	Body        i
	QueryParams *service.QueryParams
	//PathParams  *plugin.PathParams
}

type GetRealtimeDataReqBody struct {
	Query       string   `json:"query"`                  //是	*	查询语句
	Rule        string   `json:"rule,omitempty"`         //否	无	类型为IP列表的服务数据收藏名称
	IpList      []string `json:"ip_list,omitempty"`      //否	无	IP列表
	Start       int      `json:"start,omitempty"`        //否	0	分页起始
	Size        int      `json:"size,omitempty"`         //否	10	分页大小
	IgnoreCache bool     `json:"ignore_cache,omitempty"` //否	false	是否忽略缓存
	StartTime   string   `json:"start_time,omitempty"`   //否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
	EndTime     string   `json:"end_time,omitempty"`     //否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
	Include     []string `json:"include,omitempty"`      //否	无	包含字段
	Exclude     []string `json:"exclude,omitempty"`      //否	无	排除字段
	Latest      bool     `json:"latest,omitempty"`       //否	false	是否使用最新数据
}

type GetRealtimeDataReq struct {
	req *Req[GetRealtimeDataReqBody]
}

type GetRealtimeDataReqBuilder struct {
	req *Req[GetRealtimeDataReqBody]
}

func NewGetRealtimeDataBuilder() *GetRealtimeDataReqBuilder {
	builder := &GetRealtimeDataReqBuilder{}
	builder.req = &Req[GetRealtimeDataReqBody]{
		QueryParams: &service.QueryParams{},
	}
	return builder
}

// Query 是	*	查询语句
func (builder *GetRealtimeDataReqBuilder) Query(query string) *GetRealtimeDataReqBuilder {
	builder.req.Body.Query = query
	return builder
}

// Rule 否	无	类型为IP列表的服务数据收藏名称
func (builder *GetRealtimeDataReqBuilder) Rule(rule string) *GetRealtimeDataReqBuilder {
	builder.req.Body.Rule = rule
	return builder
}

// IpList 否	无	IP列表
func (builder *GetRealtimeDataReqBuilder) IpList(ipList []string) *GetRealtimeDataReqBuilder {
	builder.req.Body.IpList = ipList
	return builder
}

// Page 否	0	分页起始
func (builder *GetRealtimeDataReqBuilder) Page(page int) *GetRealtimeDataReqBuilder {
	builder.req.Body.Start = page
	return builder
}

// Size 否	10	分页大小
func (builder *GetRealtimeDataReqBuilder) Size(size int) *GetRealtimeDataReqBuilder {
	builder.req.Body.Size = size
	return builder
}

// IgnoreCache 否	false	是否忽略缓存
func (builder *GetRealtimeDataReqBuilder) IgnoreCache(ignoreCache bool) *GetRealtimeDataReqBuilder {
	builder.req.Body.IgnoreCache = ignoreCache
	return builder
}

// StartTime 否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (builder *GetRealtimeDataReqBuilder) StartTime(startTime string) *GetRealtimeDataReqBuilder {
	builder.req.Body.StartTime = startTime
	return builder
}

// EndTime 否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (builder *GetRealtimeDataReqBuilder) EndTime(endTime string) *GetRealtimeDataReqBuilder {
	builder.req.Body.EndTime = endTime
	return builder
}

// Include 否	无	包含字段
func (builder *GetRealtimeDataReqBuilder) Include(include []string) *GetRealtimeDataReqBuilder {
	builder.req.Body.Include = include
	return builder
}

// Exclude 否	无	排除字段
func (builder *GetRealtimeDataReqBuilder) Exclude(exclude []string) *GetRealtimeDataReqBuilder {
	builder.req.Body.Exclude = exclude
	return builder
}

// Latest 否	false	是否使用最新数据，只对服务数据生效
func (builder *GetRealtimeDataReqBuilder) Latest(latest bool) *GetRealtimeDataReqBuilder {
	builder.req.Body.Latest = latest
	return builder
}

func (builder *GetRealtimeDataReqBuilder) Build() *GetRealtimeDataReq {
	req := &GetRealtimeDataReq{}
	req.req = builder.req
	return req
}

type GetDeepDataReqBody struct {
	PaginationId string   `json:"pagination_id,omitempty"` //否	无	分页id，指定分页id能够获取更多分页数据，分页id过期时间为5分钟
	Query        string   `json:"query"`                   //是	*	查询语句
	Rule         string   `json:"rule,omitempty"`          //否	无	类型为IP列表的服务数据收藏名称
	IpList       []string `json:"ip_list,omitempty"`       //否	无	IP列表
	Size         int      `json:"size,omitempty"`          //否	10	分页大小
	IgnoreCache  bool     `json:"ignore_cache,omitempty"`  //否	false	是否忽略缓存
	StartTime    string   `json:"start_time,omitempty"`    //否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
	EndTime      string   `json:"end_time,omitempty"`      //否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
	Include      []string `json:"include,omitempty"`       //否	无	包含字段
	Exclude      []string `json:"exclude,omitempty"`       //否	无	排除字段
	Latest       bool     `json:"latest,omitempty"`        //否	false	是否使用最新数据
}

type GetDeepDataReq struct {
	req *Req[GetDeepDataReqBody]
}
type GetDeepDataReqBuilder struct {
	req *Req[GetDeepDataReqBody]
}

func NewGetDeepDataReqBuilder() *GetDeepDataReqBuilder {
	builder := &GetDeepDataReqBuilder{}
	builder.req = &Req[GetDeepDataReqBody]{
		QueryParams: &service.QueryParams{},
	}
	return builder
}

// PaginationId 否	无	分页id，指定分页id能够获取更多分页数据，分页id过期时间为5分钟
func (builder *GetDeepDataReqBuilder) PaginationId(paginationId string) *GetDeepDataReqBuilder {
	builder.req.Body.PaginationId = paginationId
	return builder
}

// Query 是	*	查询语句
func (builder *GetDeepDataReqBuilder) Query(query string) *GetDeepDataReqBuilder {
	builder.req.Body.Query = query
	return builder
}

// Rule 否	无	类型为IP列表的服务数据收藏名称
func (builder *GetDeepDataReqBuilder) Rule(rule string) *GetDeepDataReqBuilder {
	builder.req.Body.Rule = rule
	return builder
}

// IpList 否	无	IP列表
func (builder *GetDeepDataReqBuilder) IpList(ipList []string) *GetDeepDataReqBuilder {
	builder.req.Body.IpList = ipList
	return builder
}

// Size 否	10	分页大小
func (builder *GetDeepDataReqBuilder) Size(size int) *GetDeepDataReqBuilder {
	builder.req.Body.Size = size
	return builder
}

// IgnoreCache 否	false	是否忽略缓存
func (builder *GetDeepDataReqBuilder) IgnoreCache(ignoreCache bool) *GetDeepDataReqBuilder {
	builder.req.Body.IgnoreCache = ignoreCache
	return builder
}

// StartTime 否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (builder *GetDeepDataReqBuilder) StartTime(startTime string) *GetDeepDataReqBuilder {
	builder.req.Body.StartTime = startTime
	return builder
}

// EndTime 否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (builder *GetDeepDataReqBuilder) EndTime(endTime string) *GetDeepDataReqBuilder {
	builder.req.Body.EndTime = endTime
	return builder
}

// Include 否	无	包含字段
func (builder *GetDeepDataReqBuilder) Include(include []string) *GetDeepDataReqBuilder {
	builder.req.Body.Include = include
	return builder
}

// Exclude 否	无	排除字段
func (builder *GetDeepDataReqBuilder) Exclude(exclude []string) *GetDeepDataReqBuilder {
	builder.req.Body.Exclude = exclude
	return builder
}

// Latest 否	false	是否使用最新数据，只对服务数据生效
func (builder *GetDeepDataReqBuilder) Latest(latest bool) *GetDeepDataReqBuilder {
	builder.req.Body.Latest = latest
	return builder
}

func (builder *GetDeepDataReqBuilder) Build() *GetDeepDataReq {
	req := &GetDeepDataReq{}
	req.req = builder.req
	return req
}

type GetAggregationDataReqBody struct {
	Query           string   `json:"query,omitempty"`
	Rule            string   `json:"rule,omitempty"`
	IpList          []string `json:"ip_list,omitempty"`
	Size            int      `json:"size,omitempty"`
	IgnoreCache     bool     `json:"ignore_cache,omitempty"`
	AggregationList []string `json:"aggregation_list,omitempty"`
	StartTime       string   `json:"start_time,omitempty"`
	EndTime         string   `json:"end_time,omitempty"`
	Latest          bool     `json:"latest,omitempty"` //仅用于服务数据查询
}

type GetAggregationDataReq struct {
	req *Req[GetAggregationDataReqBody]
}

type GetAggregationDataReqBuilder struct {
	req *Req[GetAggregationDataReqBody]
}

// Query 是	*	查询语句
func (builder *GetAggregationDataReqBuilder) Query(query string) *GetAggregationDataReqBuilder {
	builder.req.Body.Query = query
	return builder
}

// Rule 否	无	类型为IP列表的服务数据收藏名称
func (builder *GetAggregationDataReqBuilder) Rule(rule string) *GetAggregationDataReqBuilder {
	builder.req.Body.Rule = rule
	return builder
}

// IpList 否	无	IP列表
func (builder *GetAggregationDataReqBuilder) IpList(ipList []string) *GetAggregationDataReqBuilder {
	builder.req.Body.IpList = ipList
	return builder
}

// Size 否	10	分页大小
func (builder *GetAggregationDataReqBuilder) Size(size int) *GetAggregationDataReqBuilder {
	builder.req.Body.Size = size
	return builder
}

// IgnoreCache 否	false	是否忽略缓存
func (builder *GetAggregationDataReqBuilder) IgnoreCache(ignoreCache bool) *GetAggregationDataReqBuilder {
	builder.req.Body.IgnoreCache = ignoreCache
	return builder
}

// AggregationList 需要获取的聚合名称列表
func (builder *GetAggregationDataReqBuilder) AggregationList(AggregationList []string) *GetAggregationDataReqBuilder {
	builder.req.Body.AggregationList = AggregationList
	return builder
}

// StartTime 否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (builder *GetAggregationDataReqBuilder) StartTime(startTime string) *GetAggregationDataReqBuilder {
	builder.req.Body.StartTime = startTime
	return builder
}

// EndTime 否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (builder *GetAggregationDataReqBuilder) EndTime(endTime string) *GetAggregationDataReqBuilder {
	builder.req.Body.EndTime = endTime
	return builder
}

// Latest 否	false	是否使用最新数据，只对服务数据生效
func (builder *GetAggregationDataReqBuilder) Latest(latest bool) *GetAggregationDataReqBuilder {
	builder.req.Body.Latest = latest
	return builder
}

func (builder *GetAggregationDataReqBuilder) Build() *GetAggregationDataReq {
	req := &GetAggregationDataReq{}
	req.req = builder.req
	return req
}
