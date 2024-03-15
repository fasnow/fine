package zone

import (
	"fine/backend/service/client"
	"fine/backend/service/model/zone"
)

type ReqBody struct {
	Query           string         `json:"query"`                       //是	str	零零信安 查询关键词（query 的值支持高级查询语法，如: group==北京、ip==47.95.5.0/24） 商业会员支持携带所属公司（company字段）进行查询。
	QueryType       zone.QueryType `json:"query_type"`                  //是	str	site	查询类型（固定值）
	Page            int            `json:"page"`                        //是	int	1	页数
	Size            int            `json:"pagesize"`                    //是	int	10	每页条数，最大40
	ZoneKeyId       string         `json:"zone_key_id"`                 //是	str	*******	您的API KEY
	TimestampSort   string         `json:"timestamp_sort,omitempty"`    //只适用于AIM数据 否	str	DESC	入库时间排序，升序: ASC, 降序: DESC
	MessageTimeSort string         `json:"message_time_sort,omitempty"` //只适用于AIM数据 否	str	DESC	消息发送时间排序，升序: ASC, 降序: DESC
}

type Req struct {
	HttpMethod  string
	ApiPath     string
	Body        ReqBody
	QueryParams *client.QueryParams
	//PathParams  *plugin.PathParams
}

type GetDataReq struct {
	req *Req
}

type GetDataReqBuilder struct {
	req *Req
}

func NewGetDataReqBuilder() *GetDataReqBuilder {
	builder := &GetDataReqBuilder{}
	builder.req = &Req{QueryParams: &client.QueryParams{}}
	return builder
}

func (builder *GetDataReqBuilder) Query(query string) *GetDataReqBuilder {
	builder.req.Body.Query = query
	return builder
}

func (builder *GetDataReqBuilder) Page(page int) *GetDataReqBuilder {
	builder.req.Body.Page = page
	return builder
}

func (builder *GetDataReqBuilder) Size(size int) *GetDataReqBuilder {
	builder.req.Body.Size = size
	return builder
}

// TimestampASCSort 只适用于AIM数据
func (builder *GetDataReqBuilder) TimestampASCSort(ASC bool) *GetDataReqBuilder {
	if ASC {
		builder.req.Body.TimestampSort = "ASC"
	} else {
		builder.req.Body.TimestampSort = "DESC"
	}
	return builder
}

// MessageTimeASCSort 只适用于AIM数据
func (builder *GetDataReqBuilder) MessageTimeASCSort(ASC bool) *GetDataReqBuilder {
	if ASC {
		builder.req.Body.TimestampSort = "ASC"
	} else {
		builder.req.Body.TimestampSort = "DESC"
	}
	return builder
}

func (builder *GetDataReqBuilder) Build() *GetDataReq {
	req := &GetDataReq{}
	req.req = builder.req
	return req
}
