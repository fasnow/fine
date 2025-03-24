package properties

import (
	"gorm.io/datatypes"
)

// MacAddressInfo 表示 MAC 地址的详细信息
type MacAddressInfo struct {
	Assignment string `json:"assignment"`
	Date       string `json:"date"`
	Org        string `json:"org"`
}

type Vuln struct {
	Verified    bool                        `json:"verified"`
	RankingEpss float64                     `json:"ranking_epss"`
	CvssV2      float64                     `json:"cvss_v2"`
	CvssVersion float64                     `json:"cvss_version"`
	Summary     string                      `json:"summary"`
	References  datatypes.JSONSlice[string] `json:"references"`
	Epss        float64                     `json:"epss"`
	Cvss        float64                     `json:"cvss"`
}

/** tag的可能值
ai	string
c2	string
cdn	string
cloud	string
compromised	string
cryptocurrency	string
database	string
devops	string
doublepulsar	string
eol-os	string
eol-product	string
honeypot	string
ics	string
iot	string
malware	string
medical	string
onion	string
open-dir	string
proxy	string
self-signed	string
scanner	string
ssh-bad-key	string
starttls	string
tor	string
videogame	string
vpn	string
*/

// General 表示通用属性信息会包含一个如SSH或者HTTP的实际数据字段
type General struct {
	Asn        string                                        `json:"asn"`
	Cpe23      datatypes.JSONSlice[string]                   `json:"cpe23"`
	Data       string                                        `json:"data"`
	Device     string                                        `json:"device"`
	Devicetype string                                        `json:"devicetype"`
	Domains    datatypes.JSONSlice[string]                   `json:"domains"`
	Hash       int                                           `json:"hash"`
	Hostnames  datatypes.JSONSlice[string]                   `json:"hostnames"`
	IP         int                                           `json:"ip"`
	IPStr      string                                        `json:"ip_str"`
	Info       string                                        `json:"info"`
	IPv6       string                                        `json:"ipv6"`
	Isp        string                                        `json:"isp"`
	Link       string                                        `json:"link"`
	Mac        datatypes.JSONType[map[string]MacAddressInfo] `json:"mac"`
	Opts       datatypes.JSONType[map[string]any]            `json:"opts"`
	Org        string                                        `json:"org"`
	OS         string                                        `json:"os"`
	Platform   string                                        `json:"platform"`
	Port       int                                           `json:"port"`
	Product    string                                        `json:"product"`
	Tags       datatypes.JSONSlice[string]                   `json:"tags"`
	Timestamp  string                                        `json:"timestamp"`
	Transport  string                                        `json:"transport"`
	Uptime     int                                           `json:"uptime"`
	Vendor     string                                        `json:"vendor"`
	Version    string                                        `json:"version"`
	Vulns      datatypes.JSONType[map[string]Vuln]           `json:"vulns"`
	Location   datatypes.JSONType[Location]                  `json:"location"`
	// 会有一个或多个产品或协议信息字段，不确定，此处只采用HTTP
	HTTP datatypes.JSONType[HTTP] `json:"http"`
}
