package fofa

import (
	"encoding/base64"
	"fine/backend/sdk/client"
	"strconv"
)

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
	builder.req.QueryParams.Set("qbase64", base64.StdEncoding.EncodeToString([]byte(query)))
	return builder
}

func (builder *GetDataReqBuilder) Page(page int64) *GetDataReqBuilder {
	builder.req.QueryParams.Set("page", strconv.Itoa(int(page)))
	return builder
}

func (builder *GetDataReqBuilder) Size(size int64) *GetDataReqBuilder {
	builder.req.QueryParams.Set("size", strconv.Itoa(int(size)))
	return builder
}

func (builder *GetDataReqBuilder) Full(full bool) *GetDataReqBuilder {
	if full {
		builder.req.QueryParams.Set("full", "true")
	} else {
		builder.req.QueryParams.Set("full", "false")
	}
	return builder
}

func (builder *GetDataReqBuilder) Fields(fields string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("fields", fields)
	return builder
}

func (builder *GetDataReqBuilder) Build() *GetDataReq {
	req := &GetDataReq{}
	req.req = builder.req
	return req
}
