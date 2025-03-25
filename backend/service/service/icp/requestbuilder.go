package icp

import (
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
	r.req.BodyMap["pageNum"] = strconv.Itoa(pageNum)
	return r
}

func (r *QueryReqBuilder) PageSize(pageSize int) *QueryReqBuilder {
	r.req.BodyMap["pageSize"] = strconv.Itoa(pageSize)
	return r
}

func (r *QueryReqBuilder) ServiceType(serviceType string) *QueryReqBuilder {
	r.req.BodyMap["serviceType"] = serviceType
	return r
}

func (r *QueryReqBuilder) UnitName(unitName string) *QueryReqBuilder {
	r.req.BodyMap["unitName"] = unitName
	return r
}

func (r *QueryReqBuilder) Build() *service.Request {
	r.req.BodyMap.Decorate(r.req)
	return r.req
}
