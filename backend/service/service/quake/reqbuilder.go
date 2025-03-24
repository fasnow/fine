package quake

import (
	"fine/backend/service/service"
)

type RealtimeHostReq struct {
	req *service.Request
}

func NewRealtimeHostReqBuilder() *RealtimeHostReq {
	builder := &RealtimeHostReq{}
	req := service.NewRequest()
	req.Method = "POST"
	builder.req = req
	return builder
}

// Query 是	*	查询语句
func (r *RealtimeHostReq) Query(query string) *RealtimeHostReq {
	r.req.BodyMap["query"] = query
	return r
}

// Rule 否	无	类型为IP列表的服务数据收藏名称
func (r *RealtimeHostReq) Rule(rule string) *RealtimeHostReq {
	r.req.BodyMap["rule"] = rule
	return r
}

// IpList 否	无	IP列表
func (r *RealtimeHostReq) IpList(ipList []string) *RealtimeHostReq {
	r.req.BodyMap["ip_list"] = ipList
	return r
}

// Page 否	0	分页起始
func (r *RealtimeHostReq) Page(page int) *RealtimeHostReq {
	r.req.BodyMap["start"] = page
	return r
}

// Size 否	10	分页大小
func (r *RealtimeHostReq) Size(size int) *RealtimeHostReq {
	r.req.BodyMap["size"] = size
	return r
}

// IgnoreCache 否	false	是否忽略缓存
func (r *RealtimeHostReq) IgnoreCache(ignoreCache bool) *RealtimeHostReq {
	r.req.BodyMap["ignore_cache"] = ignoreCache
	return r
}

// StartTime 否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (r *RealtimeHostReq) StartTime(startTime string) *RealtimeHostReq {
	r.req.BodyMap["start_time"] = startTime
	return r
}

// EndTime 否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (r *RealtimeHostReq) EndTime(endTime string) *RealtimeHostReq {
	r.req.BodyMap["end_time"] = endTime
	return r
}

// Include 否	无	包含字段
func (r *RealtimeHostReq) Include(include []string) *RealtimeHostReq {
	r.req.BodyMap["include"] = include
	return r
}

// Exclude 否	无	排除字段
func (r *RealtimeHostReq) Exclude(exclude []string) *RealtimeHostReq {
	r.req.BodyMap["exclude"] = exclude
	return r
}

func (r *RealtimeHostReq) Build() *service.Request {
	pageNum, ok := r.req.BodyMap["start"].(int)
	if !ok {
		pageNum = 1
	}
	pageSize, _ := r.req.BodyMap["size"].(int)
	r.req.BodyMap["start"] = pageSize * (pageNum - 1)
	r.req.BodyMap.Decorate(r.req)
	return r.req
}

type RealtimeServiceReq struct {
	RealtimeHostReq
}

func NewRealtimeServiceReqBuilder() *RealtimeServiceReq {
	builder := &RealtimeServiceReq{}
	req := service.NewRequest()
	req.Method = "POST"
	builder.req = req
	return builder
}

// Latest 否	false	是否使用最新数据，只对服务数据生效
func (r *RealtimeServiceReq) Latest(latest bool) *RealtimeServiceReq {
	r.req.BodyMap["latest"] = latest
	return r
}

// Query 是	*	查询语句
func (r *RealtimeServiceReq) Query(query string) *RealtimeServiceReq {
	r.RealtimeHostReq.Query(query)
	return r
}

// Rule 否	无	类型为IP列表的服务数据收藏名称
func (r *RealtimeServiceReq) Rule(rule string) *RealtimeServiceReq {
	if rule != "" {
		r.RealtimeHostReq.Rule(rule)
	}
	return r
}

// IpList 否	无	IP列表
func (r *RealtimeServiceReq) IpList(ipList []string) *RealtimeServiceReq {
	if len(ipList) > 0 {
		r.RealtimeHostReq.IpList(ipList)
	}
	return r
}

// Page 否	0	分页起始
func (r *RealtimeServiceReq) Page(page int) *RealtimeServiceReq {
	r.RealtimeHostReq.Page(page)
	return r
}

// Size 否	10	分页大小
func (r *RealtimeServiceReq) Size(Size int) *RealtimeServiceReq {
	r.RealtimeHostReq.Size(Size)
	return r
}

// IgnoreCache 否	false	是否忽略缓存
func (r *RealtimeServiceReq) IgnoreCache(ignoreCache bool) *RealtimeServiceReq {
	r.RealtimeHostReq.IgnoreCache(ignoreCache)
	return r
}

// StartTime 否	无	查询起始时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (r *RealtimeServiceReq) StartTime(startTime string) *RealtimeServiceReq {
	if startTime != "" {
		r.RealtimeHostReq.StartTime(startTime)
	}
	return r
}

// EndTime 否	无	查询截止时间，接受2020-10-14 00:00:00格式的数据，时区为UTC
func (r *RealtimeServiceReq) EndTime(endTime string) *RealtimeServiceReq {
	if endTime != "" {
		r.RealtimeHostReq.EndTime(endTime)
	}
	return r
}

// Include 否	无	包含字段
func (r *RealtimeServiceReq) Include(include []string) *RealtimeServiceReq {
	if len(include) > 0 {
		r.RealtimeHostReq.Include(include)
	}
	return r
}

// Exclude 否	无	排除字段
func (r *RealtimeServiceReq) Exclude(exclude []string) *RealtimeServiceReq {
	if len(exclude) > 0 {
		r.RealtimeHostReq.Exclude(exclude)
	}
	return r
}
