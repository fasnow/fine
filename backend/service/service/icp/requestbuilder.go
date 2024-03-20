package icp

import (
	"fine/backend/service/service"
	"strconv"
)

type Req struct {
	HttpMethod  string
	ApiPath     string
	Body        interface{}
	QueryParams *service.QueryParams
	//PathParams  *plugin.PathParams
}

type GetDataReqBuilder struct {
	req *Req
}

type GetDataReq struct {
	req *Req
}

func NewGetDataReqBuilder() *GetDataReqBuilder {
	req := &Req{
		QueryParams: &service.QueryParams{},
	}
	return &GetDataReqBuilder{req: req}
}

func (builder *GetDataReqBuilder) Query(query string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("unitName", query)
	return builder

}

func (builder *GetDataReqBuilder) Page(page int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("pageNum", strconv.Itoa(page))
	return builder
}

func (builder *GetDataReqBuilder) Size(size int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("pageSize", strconv.Itoa(size))
	return builder
}

func (builder *GetDataReqBuilder) Token(token string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("token", token)
	return builder
}

func (builder *GetDataReqBuilder) Build() *GetDataReq {
	req := &GetDataReq{}
	req.req = builder.req
	return req
}
