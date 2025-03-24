package hunter

import (
	"encoding/base64"
	"fine/backend/service/service"
	"strconv"
)

type QueryReqBuilder struct {
	req *service.Request
}

func NewQueryReqBuilder() *QueryReqBuilder {
	builder := &QueryReqBuilder{}
	req := service.NewRequest()
	req.Method = "GET"
	builder.req = req
	return builder
}

func (r *QueryReqBuilder) Query(query string) *QueryReqBuilder {
	r.req.QueryParams.Set("search", base64.URLEncoding.EncodeToString([]byte(query)))
	return r
}

func (r *QueryReqBuilder) Page(page int) *QueryReqBuilder {
	r.req.QueryParams.Set("page", strconv.Itoa(page))
	return r
}

func (r *QueryReqBuilder) Size(size int) *QueryReqBuilder {
	r.req.QueryParams.Set("page_size", strconv.Itoa(size))
	return r
}

// IsWeb 1:web 2:非web 3:全部
func (r *QueryReqBuilder) IsWeb(isWeb int) *QueryReqBuilder {
	r.req.QueryParams.Set("is_web", strconv.Itoa(isWeb))
	return r
}

func (r *QueryReqBuilder) PortFilter(portFilter bool) *QueryReqBuilder {
	if portFilter {
		r.req.QueryParams.Set("port_filter", "true")
		return r
	}
	r.req.QueryParams.Set("port_filter", "false")
	return r
}

func (r *QueryReqBuilder) StatusCode(statusCode string) *QueryReqBuilder {
	r.req.QueryParams.Set("status_code", statusCode)
	return r
}

func (r *QueryReqBuilder) StartTime(startTime string) *QueryReqBuilder {
	r.req.QueryParams.Set("start_time", startTime)
	return r
}

func (r *QueryReqBuilder) EndTime(endTime string) *QueryReqBuilder {
	r.req.QueryParams.Set("end_time", endTime)
	return r
}

func (r *QueryReqBuilder) Build() *service.Request {
	return r.req
}
