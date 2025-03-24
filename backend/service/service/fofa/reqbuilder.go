package fofa

import (
	"encoding/base64"
	"fine/backend/service/service"
	"fmt"
	"strconv"
)

type SearchAllReqBuilder struct {
	req *service.Request
}

func NewSearchAllReqBuilder() *SearchAllReqBuilder {
	builder := &SearchAllReqBuilder{}
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/search/all"
	builder.req = req
	return builder
}

func (r *SearchAllReqBuilder) Query(query string) *SearchAllReqBuilder {
	r.req.QueryParams.Set("qbase64", base64.StdEncoding.EncodeToString([]byte(query)))
	return r
}

func (r *SearchAllReqBuilder) Page(page int64) *SearchAllReqBuilder {
	r.req.QueryParams.Set("page", strconv.Itoa(int(page)))
	return r
}

func (r *SearchAllReqBuilder) Size(size int64) *SearchAllReqBuilder {
	r.req.QueryParams.Set("size", strconv.Itoa(int(size)))
	return r
}

func (r *SearchAllReqBuilder) Full(full bool) *SearchAllReqBuilder {
	if full {
		r.req.QueryParams.Set("full", "true")
	} else {
		r.req.QueryParams.Set("full", "false")
	}
	return r
}

func (r *SearchAllReqBuilder) Fields(fields string) *SearchAllReqBuilder {
	r.req.QueryParams.Set("fields", fields)
	return r
}

func (r *SearchAllReqBuilder) Build() *service.Request {
	return r.req
}

type StatAggsReqBuilder struct {
	req *service.Request
}

func NewStatAggsReqBuilder() *StatAggsReqBuilder {
	builder := &StatAggsReqBuilder{}
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/search/stats"
	builder.req = req
	return builder
}

func (r *StatAggsReqBuilder) Fields(fields string) *StatAggsReqBuilder {
	r.req.QueryParams.Set("fields", fields)
	return r
}

func (r *StatAggsReqBuilder) Query(query string) *StatAggsReqBuilder {
	r.req.QueryParams.Set("qbase64", base64.StdEncoding.EncodeToString([]byte(query)))
	return r
}

func (r *StatAggsReqBuilder) Build() *service.Request {
	return r.req
}

type HostAggsReqBuilder struct {
	req *service.Request
}

func NewHostStatReqBuilder() *HostAggsReqBuilder {
	builder := &HostAggsReqBuilder{}
	req := service.NewRequest()
	req.Method = "GET"
	builder.req = req
	return builder
}

func (r *HostAggsReqBuilder) Detail(detail bool) *HostAggsReqBuilder {
	if detail {
		r.req.QueryParams.Set("detail", "true")
	} else {
		r.req.QueryParams.Set("detail", "false")
	}
	return r
}

func (r *HostAggsReqBuilder) Host(host string) *HostAggsReqBuilder {
	r.req.Path = fmt.Sprintf("/host/%s", host)
	return r
}

func (r *HostAggsReqBuilder) Build() *service.Request {
	return r.req
}
