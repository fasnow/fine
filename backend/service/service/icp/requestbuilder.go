package icp

import (
	"bytes"
	"encoding/json"
	"fine/backend/service/service"
	"strconv"
)

type QueryReqBuilder struct {
	req         *service.Request
	unitName    string
	page        int
	size        int
	serviceType string // 1,6,7,8 网站，app，小程序，快应用
}

func NewQueryReqBuilder() *QueryReqBuilder {
	builder := &QueryReqBuilder{}
	req := service.NewRequest()
	req.Method = "POST"
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Referer", referer)
	req.Header.Set("Cookie", "__jsluid_s=8e209cf6c7c40f530a300ac8dd0eb6c7")
	builder.req = req
	return builder
}

func (r *QueryReqBuilder) PageNum(pageNum int) *QueryReqBuilder {
	r.req.BodyParams.Set("pageNum", strconv.Itoa(pageNum))
	return r
}

func (r *QueryReqBuilder) PageSize(pageSize int) *QueryReqBuilder {
	r.req.BodyParams.Set("pageSize", strconv.Itoa(pageSize))
	return r
}

func (r *QueryReqBuilder) ServiceType(serviceType string) *QueryReqBuilder {
	r.req.BodyParams.Set("serviceType", serviceType)
	return r
}

func (r *QueryReqBuilder) UnitName(unitName string) *QueryReqBuilder {
	r.req.BodyParams.Set("unitName", unitName)
	return r
}

func (r *QueryReqBuilder) Build() *service.Request {
	pageNum, _ := strconv.Atoi(r.req.BodyParams.Get("pageNum"))
	pageSize, _ := strconv.Atoi(r.req.BodyParams.Get("pageSize"))
	data := map[string]any{
		"pageNum":     pageNum,
		"pageSize":    pageSize,
		"serviceType": r.req.BodyParams.Get("serviceType"),
		"unitName":    r.req.BodyParams.Get("unitName"),
	}
	bt, _ := json.Marshal(data)
	r.req.Body = bytes.NewReader(bt)
	return r.req
}
