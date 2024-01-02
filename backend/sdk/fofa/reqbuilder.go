package fofa

import (
	"encoding/base64"
	"fine-server/sdk"
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
		QueryParams: &sdk.QueryParams{},
	}
	return builder
}

func (builder *GetDataReqBuilder) Query(query string) *GetDataReqBuilder {
	builder.req.QueryParams.Set("qbase64", base64.StdEncoding.EncodeToString([]byte(query)))
	return builder
}

func (builder *GetDataReqBuilder) Page(page int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("page", strconv.Itoa(page))
	return builder
}

func (builder *GetDataReqBuilder) Size(size int) *GetDataReqBuilder {
	builder.req.QueryParams.Set("size", strconv.Itoa(size))
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
