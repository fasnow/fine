package routes

import (
	"fine-server/sdk/ip138"
	"fine-server/sdk/quake"
	"fine-server/sdk/zone"
	"github.com/gorilla/websocket"
	"net/http"
)

var (
	NoJsonKeyStringError = "invalid character ',' looking for beginning of object key string"
)

const (
	updateUrl = "https://api.github.com/repos/fasnow/fine/releases/latest"
)

type AllQueryCacheItem struct {
	fofaAvailablePage   int
	hunterAvailablePage int
	zoneAvailablePage   int
	quakeAvailablePage  int
	statement           string
	Status              exportStatus
	Filename            string
}

type AllQueryStep2ResultItem struct {
	Ip         string `json:"ip"`
	Host       string `json:"host"`
	Port       string `json:"port"`
	Protocol   string `json:"protocol"`
	Domain     string `json:"domain"`
	Title      string `json:"title"`
	StatusCode string `json:"statusCode"`
	IcpRecord  string `json:"icpRecord"`
}

type AllQueryStep1Result struct {
	HasMore bool   `json:"hasMore"`
	Name    string `json:"name"`
	Total   int64  `json:"total"`
	MaxPage int    `json:"maxPage"`
	Size    int    `json:"size"`
	Token   any    `json:"token"`
	Error   string `json:"error"`
	UUID    string `json:"id"`
}

type AllQueryStep2Params struct {
	UUID          string `json:"id"`
	FofaMaxPage   int    `json:"fofaMaxPage"`
	HunterMaxPage int    `json:"hunterMaxPage"`
	ZoneMaxPage   int    `json:"0.zoneMaxPage"`
	QuakeMaxPage  int    `json:"quakeMaxPage"`
}

type FofaQueryOptions struct {
	Query  string `json:"query"`
	Page   int    `json:"Page"`
	Size   int    `json:"size"`
	Full   bool   `json:"full"`
	Fields string `json:"fields"`
}
type exportStatus int

const (
	Waiting   string = "waiting"
	Exporting string = "exporting"
	Finished  string = "finished"
)

type FofaExportCacheItem struct {
	Page     int
	Total    int64
	Options  FofaQueryOptions
	Message  string
	Filename string
}

type HunterQueryOptions struct {
	Query      string `json:"query"`      //是 经过符合RFC 4648标准的base64url编码编码后的搜索语法，语法规则见首页-查询语法
	StartTime  string `json:"startTime"`  //否 开始时间，格式为2021-01-01
	EndTime    string `json:"endTime"`    //否 结束时间，格式为2021-03-01
	Page       int    `json:"page"`       //是 页码
	Size       int    `json:"size"`       //是 每页资产条数
	IsWeb      int    `json:"isWeb"`      //否 资产类型，1代表”web资产“，2代表”非web资产“，3代表”全部“
	StatusCode string `json:"statusCode"` //否 状态码列表，以逗号分隔，如”200,401“
	PortFilter bool   `json:"portFilter"` //否 数据过滤参数，true为开启，false为关闭
}

type HunterExportCacheItem struct {
	Page     int
	Total    int64
	Options  HunterQueryOptions
	Filename string
	Message  string
}

type ZoneQueryOptions struct {
	Query           string         `json:"query"`
	QueryType       zone.QueryType `json:"type,omitempty"`
	Page            int            `json:"page"`
	Size            int            `json:"size"`
	TimestampSort   bool           `json:"timestampSort,omitempty"`   //只适用于AIM数据 默认DESC 入库时间排序，升序: ASC, 降序: DESC
	MessageTimeSort bool           `json:"messageTimeSort,omitempty"` //只适用于AIM数据 默认DESC 消息发送时间排序，升序: ASC, 降序: DESC
}

type ZoneExportCacheItem struct {
	Page     int
	Options  ZoneQueryOptions
	Message  string
	Filename string
}

type QuakeRealtimeDataQueryOptions struct {
	Query       string   `json:"query,omitempty"`
	Rule        string   `json:"rule,omitempty"`
	IpList      []string `json:"ipList,omitempty"`
	Page        int      `json:"page,omitempty"`
	Size        int      `json:"size,omitempty"`
	IgnoreCache bool     `json:"ignoreCache,omitempty"`
	StartTime   string   `json:"startTime,omitempty"`
	EndTime     string   `json:"endTime,omitempty"`
	Include     []string `json:"include,omitempty"`
	Exclude     []string `json:"exclude,omitempty"`
	Latest      bool     `json:"latest,omitempty"` //仅用于实时服务数据查询
}

type QuakeExportCacheItem struct {
	QueryType quake.QueryType
	Page      int
	Total     int64
	Options   QuakeRealtimeDataQueryOptions
	Message   string
	Filename  string
}

type ExportDataReqBody struct {
	UUID string `json:"id"`
	Page int    `json:"page"`
}

type IcpExportCacheItem struct {
	Page     int
	Size     int
	UnitName string
	Total    int
	Status   exportStatus
	Filename string
}

var ip138BatchIp2DomainResultCache struct {
	item      []ip138.DomainItem
	hasMore   bool
	error     error
	Exporting exportStatus
}

var Ip138BatchGetDomain2IpResultCache struct {
	item      []ip138.IPItem
	hasMore   bool
	error     error
	Exporting exportStatus
}

var (
	fofaPageSize   = 400
	hunterPageSize = 100
	zonePageSize   = 40
	quakePageSize  = 100
)

var (
	unitCount int
)

type WsOutput struct {
	HasMore bool   `json:"hasMore"`
	Data    any    `json:"items"` //应该是个列表
	Total   int    `json:"total"`
	Message string `json:"message,omitempty"`
}

var Upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type ExportStatusResponse struct {
	Message  string `json:"message,omitempty"`
	Filename string `json:"filename,omitempty"`
}
