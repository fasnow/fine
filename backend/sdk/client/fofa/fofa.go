package fofa

import (
	"github.com/fasnow/ghttp"
)

const (
	// FofaApiUrl fofa api
	FofaApiUrl = "https://fofa.info/api/v1/search/all"
	// FofaUserApiUrl user api
	FofaUserApiUrl = "https://fofa.info/api/v1/info/my"
)

var FieldMap = map[string]string{
	"link":             "link",
	"ip":               "ip",
	"port":             "port",
	"protocol":         "protocol",
	"country":          "country",
	"country_name":     "country_name",
	"region":           "region",
	"city":             "city",
	"longitude":        "longitude",
	"latitude":         "latitude",
	"as_number":        "as_number",
	"as_organization":  "as_organization",
	"host":             "host",
	"domain":           "domain",
	"os":               "os",
	"server":           "server",
	"icp":              "icp",
	"title":            "title",
	"jarm":             "jarm",
	"header":           "header",
	"banner":           "banner",
	"cert":             "cert",
	"base_protocol":    "base_protocol",
	"product":          "product",
	"product_category": "product_category",
	"version":          "version",
	"lastupdatetime":   "lastupdatetime",
	"cname":            "cname",
	"icon_hash":        "icon_hash",
	"certs_valid":      "certs_valid",
	"cname_domain":     "cname_domain",
	"body":             "body",
	"icon":             "icon",
	"fid":              "fid",
	"structinfo":       "structinfo",
}

var Fields = struct {
	Ip              string `json:"ip,omitempty"`               //ip	    			ip地址				权限：无
	Port            string `json:"port,omitempty"`             //port				端口					权限：无
	Protocol        string `json:"protocol,omitempty"`         //protocol			协议名				权限：无
	Country         string `json:"country,omitempty"`          //country			国家代码				权限：无
	CountryName     string `json:"country_name,omitempty"`     //country_name		国家名				权限：无
	Region          string `json:"region,omitempty"`           //region				区域					权限：无
	City            string `json:"city,omitempty"`             //city				城市					权限：无
	Longitude       string `json:"longitude,omitempty"`        //longitude			地理位置 经度			权限：无
	Latitude        string `json:"latitude,omitempty"`         //latitude			地理位置 纬度			权限：无
	AsNumber        string `json:"as_number,omitempty"`        //as_number			asn编号				权限：无
	AsOrganization  string `json:"as_organization,omitempty"`  //as_organization	asn组织				权限：无
	Host            string `json:"host,omitempty"`             //host				主机名				权限：无
	Domain          string `json:"domain,omitempty"`           //domain				域名					权限：无
	Os              string `json:"os,omitempty"`               //os				    操作系统				权限：无
	Server          string `json:"server,omitempty"`           //server				网站server			权限：无
	Icp             string `json:"icp,omitempty"`              //icp				icp备案号			权限：无
	Title           string `json:"title,omitempty"`            //title				网站标题				权限：无
	Jarm            string `json:"jarm,omitempty"`             //jarm				jarm 指纹			权限：无
	Header          string `json:"header,omitempty"`           //header				网站header			权限：无
	Banner          string `json:"banner,omitempty"`           //banner				协议 banner			权限：无
	Cert            string `json:"cert,omitempty"`             //cert				证书					权限：无
	BaseProtocol    string `json:"base_protocol,omitempty"`    //base_protocol		基础协议，比如tcp/udp	权限：无
	Link            string `json:"link,omitempty"`             //link				资产的URL链接			权限：无
	Product         string `json:"product,omitempty"`          //product			产品名				权限：专业版本及以上
	ProductCategory string `json:"product_category,omitempty"` //product_category   产品分类			    权限：专业版本及以上
	Version         string `json:"version,omitempty"`          //version			版本号				权限：专业版本及以上
	LastUpdateTime  string `json:"lastupdatetime,omitempty"`   //lastupdatetime		FOFA最后更新时间	    权限：专业版本及以上
	Cname           string `json:"cname,omitempty"`            //cname				域名cname			权限：专业版本及以上
	IconHash        string `json:"icon_hash,omitempty"`        //icon_hash		    返回的icon_hash值	权限：商业版本及以上
	CertsValid      string `json:"certs_valid,omitempty"`      //certs_valid		证书是否有效			权限：商业版本及以上
	CnameDomain     string `json:"cname_domain,omitempty"`     //cname_domain		cname的域名			权限：商业版本及以上
	Body            string `json:"body,omitempty"`             //body				网站正文内容			权限：商业版本及以上
	Icon            string `json:"icon,omitempty"`             //icon				icon 图标			权限：企业会员
	Fid             string `json:"fid,omitempty"`              //fid	     		fid					权限：企业会员
	Structinfo      string `json:"structinfo,omitempty"`       //structinfo			结构化信息 (部分协议支持、比如elastic、mongodb)	权限：企业会员
}{
	Ip:              "ip",
	Port:            "port",
	Protocol:        "protocol",
	Country:         "country",
	CountryName:     "country_name",
	Region:          "region",
	City:            "city",
	Longitude:       "longitude",
	Latitude:        "latitude",
	AsNumber:        "as_number",
	AsOrganization:  "as_organization",
	Host:            "host",
	Domain:          "domain",
	Os:              "os",
	Server:          "server",
	Icp:             "icp",
	Title:           "title",
	Jarm:            "jarm",
	Header:          "header",
	Banner:          "banner",
	Cert:            "cert",
	BaseProtocol:    "base_protocol",
	Link:            "link",
	Product:         "product",
	ProductCategory: "product_category",
	Version:         "version",
	LastUpdateTime:  "lastupdatetime",
	Cname:           "cname",
	IconHash:        "icon_hash",
	CertsValid:      "certs_valid",
	CnameDomain:     "cname_domain",
	Body:            "body",
	Icon:            "icon",
	Fid:             "fid",
	Structinfo:      "structinfo",
}

type Fofa struct {
	email string
	key   string
	http  *ghttp.Client
}

func NewClient(email, key string) *Fofa {
	return &Fofa{
		email: email,
		key:   key,
		http:  &ghttp.Client{},
	}
}

func (f *Fofa) SetAuth(email, key string) {
	f.email = email
	f.key = key
}
