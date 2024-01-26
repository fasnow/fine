package hunter

import (
	"encoding/base64"
	"fine/backend/sdk/client"
	"strconv"
)

type Req struct {
	HttpMethod  string
	ApiPath     string
	Body        interface{}
	QueryParams *client.QueryParams
	//PathParams  *plugin.PathParams
}

type GetDataReqBuilder struct {
	req *Req
}

type GetDataReq struct {
	req *Req
}

func NewGetDataReqBuilder() *GetDataReqBuilder {
	builder := &GetDataReqBuilder{}
	builder.req = &Req{
		QueryParams: &client.QueryParams{},
	}
	return builder
}

func (builder *GetDataReqBuilder) Query(query string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("search", base64.URLEncoding.EncodeToString([]byte(query)))
	return builder
}

func (builder *GetDataReqBuilder) Page(page int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("page", strconv.Itoa(page))
	return builder
}

func (builder *GetDataReqBuilder) Size(size int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("page_size", strconv.Itoa(size))
	return builder
}

// IsWeb 1:web 2:非web 3:全部
func (builder *GetDataReqBuilder) IsWeb(isWeb int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("is_web", strconv.Itoa(isWeb))
	return builder
}

func (builder *GetDataReqBuilder) PortFilter(portFilter bool) *GetDataReqBuilder {
	if portFilter {
		builder.req.QueryParams.Set("port_filter", "true")
		return builder
	}
	builder.req.QueryParams.Set("port_filter", "false")
	return builder
}

func (builder *GetDataReqBuilder) StatusCode(statusCode string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("status_code", statusCode)
	return builder
}

func (builder *GetDataReqBuilder) StartTime(startTime string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("start_time", startTime)
	return builder
}

func (builder *GetDataReqBuilder) EndTime(endTime string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("end_time", endTime)
	return builder
}

func (builder *GetDataReqBuilder) Build() *GetDataReq {
	req := &GetDataReq{}
	req.req = builder.req
	return req
}
