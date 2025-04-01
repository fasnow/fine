package fofa

import (
	"encoding/json"
	"errors"
	"fine/backend/service/model/fofa"
	"fine/backend/service/service"
	"fine/backend/utils"
	"github.com/fasnow/goproxy"
	"github.com/tidwall/gjson"
	"net/http"
	netUrl "net/url"
	"strconv"
	"strings"
	"sync"
)

const (
	BaseAPIUrl = "https://fofa.info/api/v1"
	UserAPIUrl = "https://fofa.info/api/v1/info/my"
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
	key             string
	http            *http.Client
	StatisticalAggs *StatisticalAggs
	HostAggs        *HostAggs
}

func New(key string) *Fofa {
	f := &Fofa{
		key:  key,
		http: &http.Client{},
	}
	f.StatisticalAggs = &StatisticalAggs{fofa: f}
	f.HostAggs = &HostAggs{fofa: f}
	return f
}

func (r *Fofa) UseProxyManager(manager *goproxy.GoProxy) {
	r.http = manager.GetClient()
}

func (r *Fofa) SetAuth(key string) {
	r.key = key
}

func (r *Fofa) GenAuthQueryParam() netUrl.Values {
	params := netUrl.Values{}
	params.Set("key", r.key)
	return params
}

type Result struct {
	Query    string       `json:"query"`
	Total    int64        `json:"total"`
	PageNum  int          `json:"pageNum"`
	PageSize int          `json:"pageSize"`
	Items    []*fofa.Item `json:"items"`
}

func (r *Fofa) request(req *service.Request) ([]byte, error) {
	req.QueryParams.Set("key", r.key)
	return req.Fetch(r.http, BaseAPIUrl, func(response *http.Response) error {
		if response.StatusCode != 200 {
			return errors.New(response.Status)
		}
		return nil
	})
}

func (r *Fofa) Query(req *service.Request) (*Result, error) {
	var fields = req.QueryParams.Get("fields")
	var fieldList = strings.Split(fields, ",")
	if fields != "" {
		for _, field := range fieldList {
			if _, ok := FieldMap[field]; !ok {
				return nil, errors.New("错误的查询字段:" + field)
			}
		}
	}
	bytes, err := r.request(req)
	if err != nil {
		return nil, err
	}
	var tmpResponse struct {
		Error           bool   `json:"error"`
		ErrMsg          string `json:"errmsg"`
		ConsumedFpoint  int    `json:"consumed_fpoint"`
		RequiredFpoints int    `json:"required_fpoints"`
		Total           int64  `json:"size"`
		PageNum         int    `json:"page"`
		Mode            string `json:"mode"`
		Query           string `json:"query"`
	}
	err = json.Unmarshal(bytes, &tmpResponse)
	if err != nil {
		return nil, err
	}
	if tmpResponse.Error {
		return nil, errors.New(tmpResponse.ErrMsg)
	}

	items := gjson.Get(string(bytes), "results").Array()

	// 把不带键的 [[],[]...] 转成带键的 [{},{}...]
	formatItems, err := r.formatItems(items, fields)
	if err != nil {
		return nil, err
	}

	var resp Result
	resp.Items = formatItems
	resp.Query = tmpResponse.Query
	resp.PageNum = tmpResponse.PageNum
	size, _ := strconv.Atoi(req.QueryParams.Get("size"))
	resp.PageSize = size
	resp.Total = tmpResponse.Total
	if resp.Items == nil {
		resp.Items = make([]*fofa.Item, 0)
	}
	return &resp, nil
}

// fofa查询结果是不带键的，会按照你查询时给定的fields的先后顺序输出，每个item是 [] 此处是把每个item附上键变成 {"field":"value"}，键名为fields的每个字段
func (r *Fofa) formatItems(items []gjson.Result, fields string) ([]*fofa.Item, error) {
	if len(items) == 0 {
		return make([]*fofa.Item, 0), nil
	}
	var keys []string
	for _, v := range strings.Split(fields, ",") {
		if v != "" {
			keys = append(keys, v)
		}
	}
	var newItems = make([]*fofa.Item, 0)
	if len(keys) == 0 {
		//fields 为空 fofa默认按照 host,ip,port先后顺序返回
		for _, item := range items {
			v := item.Array()
			var tmpItem = &fofa.Item{
				Host: v[0].String(),
				Ip:   v[1].String(),
				Port: v[2].String(),
			}
			newItems = append(newItems, tmpItem)
		}
	} else if len(keys) == 1 {
		//传入的field只有一个的话，只会返回 字符串列表 不会返回 字典列表
		for _, item := range items {
			var tmpItem = &fofa.Item{}
			v := item.String()
			switch keys[0] {
			case FieldMap["ip"]:
				tmpItem.Ip = v
				break
			case FieldMap["port"]:
				tmpItem.Port = v
				break
			case FieldMap["protocol"]:
				tmpItem.Protocol = v
				break
			case FieldMap["country"]:
				tmpItem.Country = v
				break
			case FieldMap["country_name"]:
				tmpItem.CountryName = v
				break
			case FieldMap["region"]:
				tmpItem.Region = v
				break
			case FieldMap["city"]:
				tmpItem.City = v
				break
			case FieldMap["longitude"]:
				tmpItem.Longitude = v
				break
			case FieldMap["latitude"]:
				tmpItem.Latitude = v
				break
			case FieldMap["as_number"]:
				tmpItem.AsNumber = v
				break
			case FieldMap["as_organization"]:
				tmpItem.AsOrganization = v
				break
			case FieldMap["host"]:
				tmpItem.Host = v
				break
			case FieldMap["domain"]:
				tmpItem.Domain = v
				break
			case FieldMap["os"]:
				tmpItem.Os = v
				break
			case FieldMap["server"]:
				tmpItem.Server = v
				break
			case FieldMap["icp"]:
				tmpItem.Icp = v
				break
			case FieldMap["title"]:
				tmpItem.Title = v
				break
			case FieldMap["jarm"]:
				tmpItem.Jarm = v
				break
			case FieldMap["header"]:
				tmpItem.Header = v
				break
			case FieldMap["banner"]:
				tmpItem.Banner = v
				break
			case FieldMap["cert"]:
				tmpItem.Cert = v
				break
			case FieldMap["base_protocol"]:
				tmpItem.BaseProtocol = v
				break
			case FieldMap["link"]:
				tmpItem.Link = v
				break
			case FieldMap["product"]:
				tmpItem.Product = v
				break
			case FieldMap["product_category"]:
				tmpItem.ProductCategory = v
				break
			case FieldMap["version"]:
				tmpItem.Version = v
				break
			case FieldMap["lastupdatetime"]:
				tmpItem.LastUpdateTime = v
				break
			case FieldMap["cname"]:
				tmpItem.Cname = v
				break
			case FieldMap["icon_hash"]:
				tmpItem.IconHash = v
				break
			case FieldMap["certs_valid"]:
				tmpItem.CertsValid = v
				break
			case FieldMap["cname_domain"]:
				tmpItem.CnameDomain = v
				break
			case FieldMap["body"]:
				tmpItem.Body = v
				break
			case FieldMap["icon"]:
				tmpItem.Icon = v
				break
			case FieldMap["fid"]:
				tmpItem.Fid = v
				break
			case FieldMap["structinfo"]:
				tmpItem.Structinfo = v
				break
			}
			newItems = append(newItems, tmpItem)
		}
	} else {
		//其他情况按字段先后返回
		for _, item := range items {
			v := item.Array()
			var tmpItem = &fofa.Item{}
			for j := 0; j < len(keys); j++ {
				switch keys[j] {
				case FieldMap["ip"]:
					tmpItem.Ip = v[j].String()
					break
				case FieldMap["port"]:
					tmpItem.Port = v[j].String()
					break
				case FieldMap["protocol"]:
					tmpItem.Protocol = v[j].String()
					break
				case FieldMap["country"]:
					tmpItem.Country = v[j].String()
					break
				case FieldMap["country_name"]:
					tmpItem.CountryName = v[j].String()
					break
				case FieldMap["region"]:
					tmpItem.Region = v[j].String()
					break
				case FieldMap["city"]:
					tmpItem.City = v[j].String()
					break
				case FieldMap["longitude"]:
					tmpItem.Longitude = v[j].String()
					break
				case FieldMap["latitude"]:
					tmpItem.Latitude = v[j].String()
					break
				case FieldMap["as_number"]:
					tmpItem.AsNumber = v[j].String()
					break
				case FieldMap["as_organization"]:
					tmpItem.AsOrganization = v[j].String()
					break
				case FieldMap["host"]:
					tmpItem.Host = v[j].String()
					break
				case FieldMap["domain"]:
					tmpItem.Domain = v[j].String()
					break
				case FieldMap["os"]:
					tmpItem.Os = v[j].String()
					break
				case FieldMap["server"]:
					tmpItem.Server = v[j].String()
					break
				case FieldMap["icp"]:
					tmpItem.Icp = v[j].String()
					break
				case FieldMap["title"]:
					tmpItem.Title = v[j].String()
					break
				case FieldMap["jarm"]:
					tmpItem.Jarm = v[j].String()
					break
				case FieldMap["header"]:
					tmpItem.Header = v[j].String()
					break
				case FieldMap["banner"]:
					tmpItem.Banner = v[j].String()
					break
				case FieldMap["cert"]:
					tmpItem.Cert = v[j].String()
					break
				case FieldMap["base_protocol"]:
					tmpItem.BaseProtocol = v[j].String()
					break
				case FieldMap["link"]:
					tmpItem.Link = v[j].String()
					break
				case FieldMap["product"]:
					tmpItem.Product = v[j].String()
					break
				case FieldMap["product_category"]:
					tmpItem.ProductCategory = v[j].String()
					break
				case FieldMap["version"]:
					tmpItem.Version = v[j].String()
					break
				case FieldMap["lastupdatetime"]:
					tmpItem.LastUpdateTime = v[j].String()
					break
				case FieldMap["cname"]:
					tmpItem.Cname = v[j].String()
					break
				case FieldMap["icon_hash"]:
					tmpItem.IconHash = v[j].String()
					break
				case FieldMap["certs_valid"]:
					tmpItem.CertsValid = v[j].String()
					break
				case FieldMap["cname_domain"]:
					tmpItem.CnameDomain = v[j].String()
					break
				case FieldMap["body"]:
					tmpItem.Body = v[j].String()
					break
				case FieldMap["icon"]:
					tmpItem.Icon = v[j].String()
					break
				case FieldMap["fid"]:
					tmpItem.Fid = v[j].String()
					break
				case FieldMap["structinfo"]:
					tmpItem.Structinfo = v[j].String()
					break
				}
			}
			newItems = append(newItems, tmpItem)
		}
	}
	return newItems, nil
}

func (r *Fofa) Export(items []*fofa.Item, outputFilepath string, exportFields ...string) error {
	//根据link去重
	seenLinks := make(map[string]struct{})
	var uniqueItems []*fofa.Item
	for _, item := range items {
		if item.Link != "" {
			if _, seen := seenLinks[item.Link]; !seen {
				uniqueItems = append(uniqueItems, item)
				seenLinks[item.Link] = struct{}{}
			} else {
				if item.Title != "" {
					for i, uniqueItem := range uniqueItems {
						if uniqueItem.Link == item.Link && uniqueItem.Title == "" {
							var tmp []*fofa.Item
							if i < len(uniqueItems)-1 {
								tmp = uniqueItems[i+1:]
							}
							uniqueItems = append(uniqueItems[:i], item)
							uniqueItems = append(uniqueItems, tmp...)
							break
						}
					}
				}
			}
		} else {
			uniqueItems = append(uniqueItems, item)
		}
	}

	var fields []string
	for _, field := range FieldMap {
		fields = append(fields, field)
	}
	var data [][]any
	var headers []string
	if len(exportFields) > 0 {
		headers = append([]string{"id"}, strings.Split(exportFields[0], ",")...)
	} else {
		headers = append([]string{"id"}, fields...)
	}
	var tmpHeaders []any
	for _, header := range headers {
		tmpHeaders = append(tmpHeaders, header)
	}
	data = append(data, tmpHeaders)
	for i, item := range uniqueItems {
		var tmpItem []any
		for _, header := range headers {
			switch header {
			case "id":
				tmpItem = append(tmpItem, i+1)
				break
			case FieldMap["ip"]:
				tmpItem = append(tmpItem, item.Ip)
				break
			case FieldMap["port"]:
				tmpItem = append(tmpItem, item.Port)
				break
			case FieldMap["protocol"]:
				tmpItem = append(tmpItem, item.Protocol)
				break
			case FieldMap["country"]:
				tmpItem = append(tmpItem, item.Country)
				break
			case FieldMap["country_name"]:
				tmpItem = append(tmpItem, item.CountryName)
				break
			case FieldMap["region"]:
				tmpItem = append(tmpItem, item.Region)
				break
			case FieldMap["city"]:
				tmpItem = append(tmpItem, item.City)
				break
			case FieldMap["longitude"]:
				tmpItem = append(tmpItem, item.Longitude)
				break
			case FieldMap["latitude"]:
				tmpItem = append(tmpItem, item.Latitude)
				break
			case FieldMap["as_number"]:
				tmpItem = append(tmpItem, item.AsNumber)
				break
			case FieldMap["as_organization"]:
				tmpItem = append(tmpItem, item.AsOrganization)
				break
			case FieldMap["host"]:
				tmpItem = append(tmpItem, item.Host)
				break
			case FieldMap["domain"]:
				tmpItem = append(tmpItem, item.Domain)
				break
			case FieldMap["os"]:
				tmpItem = append(tmpItem, item.Os)
				break
			case FieldMap["server"]:
				tmpItem = append(tmpItem, item.Server)
				break
			case FieldMap["icp"]:
				tmpItem = append(tmpItem, item.Icp)
				break
			case FieldMap["title"]:
				tmpItem = append(tmpItem, item.Title)
				break
			case FieldMap["jarm"]:
				tmpItem = append(tmpItem, item.Jarm)
				break
			case FieldMap["header"]:
				tmpItem = append(tmpItem, item.Header)
				break
			case FieldMap["banner"]:
				tmpItem = append(tmpItem, item.Banner)
				break
			case FieldMap["cert"]:
				tmpItem = append(tmpItem, item.Cert)
				break
			case FieldMap["base_protocol"]:
				tmpItem = append(tmpItem, item.BaseProtocol)
				break
			case FieldMap["link"]:
				tmpItem = append(tmpItem, item.Link)
				break
			case FieldMap["product"]:
				tmpItem = append(tmpItem, item.Product)
				break
			case FieldMap["product_category"]:
				tmpItem = append(tmpItem, item.ProductCategory)
				break
			case FieldMap["version"]:
				tmpItem = append(tmpItem, item.Version)
				break
			case FieldMap["lastupdatetime"]:
				tmpItem = append(tmpItem, item.LastUpdateTime)
				break
			case FieldMap["cname"]:
				tmpItem = append(tmpItem, item.Cname)
				break
			case FieldMap["icon_hash"]:
				tmpItem = append(tmpItem, item.IconHash)
				break
			case FieldMap["certs_valid"]:
				tmpItem = append(tmpItem, item.CertsValid)
				break
			case FieldMap["cname_domain"]:
				tmpItem = append(tmpItem, item.CnameDomain)
				break
			case FieldMap["body"]:
				tmpItem = append(tmpItem, item.Body)
				break
			case FieldMap["icon"]:
				tmpItem = append(tmpItem, item.Icon)
				break
			case FieldMap["fid"]:
				tmpItem = append(tmpItem, item.Fid)
				break
			case FieldMap["structinfo"]:
				tmpItem = append(tmpItem, item.Structinfo)
				break
			}
		}
		data = append(data, tmpItem)
	}
	err := utils.SaveToExcel(data, outputFilepath)
	if err != nil {
		return err
	}
	return nil
}

type User struct {
	Email           string `json:"email"`
	Username        string `json:"username"`
	Category        string `json:"category"`
	Fcoin           int    `json:"fcoin"`
	FofaPoint       int    `json:"fofa_point"`
	RemainFreePoint int    `json:"remain_free_point"`
	RemainAPIQuery  int    `json:"remain_api_query"`
	RemainAPIData   int    `json:"remain_api_data"`
	IsVip           bool   `json:"isvip"`
	VipLevel        int    `json:"vip_level"`
	IsVerified      bool   `json:"is_verified"`
	Avatar          string `json:"avatar"`
	Message         string `json:"message"`
	FofacliVer      string `json:"fofacli_ver"`
	FofaServer      bool   `json:"fofa_server"`
}

func (r *Fofa) User() (*User, error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.QueryParams = r.GenAuthQueryParam()
	bytes, err := req.Fetch(r.http, UserAPIUrl, nil)
	if err != nil {
		return nil, err
	}
	var tmpResponse struct {
		User
		Error  bool   `json:"error"`
		ErrMsg string `json:"errmsg,omitempty'"`
	}
	if err = json.Unmarshal(bytes, &tmpResponse); err != nil {
		return nil, err
	}
	if tmpResponse.Error {
		return nil, errors.New(tmpResponse.ErrMsg)
	}
	return &tmpResponse.User, nil
}

type StatisticalAggs struct {
	fofa   *Fofa
	query  string
	fields string
}

type StatisticalAggsResult struct {
	Error           bool `json:"error"`
	ConsumedFpoint  int  `json:"consumed_fpoint"`
	RequiredFpoints int  `json:"required_fpoints"`
	Size            int  `json:"size"`
	Distinct        struct {
		Domain int `json:"domain"`
		Fid    int `json:"fid"`
		Icp    int `json:"icp"`
		IP     int `json:"ip"`
		Ipc    int `json:"ipc"`
		Server int `json:"server"`
		Title  int `json:"title"`
	} `json:"distinct"`
	Aggs           fofa.Aggs `json:"aggs"`
	Lastupdatetime string    `json:"lastupdatetime"`
}

func (r *StatisticalAggs) Query(req *service.Request) (*StatisticalAggsResult, error) {
	bytes, err := r.fofa.request(req)
	if err != nil {
		return nil, err
	}
	bodyStr := string(bytes)
	isError := gjson.Get(bodyStr, "error").Bool()
	if isError {
		errMsg := gjson.Get(bodyStr, "errmsg").String()
		return nil, errors.New(errMsg)
	}
	var aggs StatisticalAggsResult
	err = json.Unmarshal(bytes, &aggs)
	if err != nil {
		return nil, err
	}
	return &aggs, nil
}

type HostAggs struct {
	fofa   *Fofa
	host   string
	detail bool
	mutex  sync.Mutex
}

type HostAggsResult struct {
	Error           bool        `json:"error"`
	Host            string      `json:"host"`
	ConsumedFpoint  int         `json:"consumed_fpoint"`
	RequiredFpoints int         `json:"required_fpoints"`
	IP              string      `json:"ip"`
	Asn             int         `json:"asn"`
	Org             string      `json:"org"`
	CountryName     string      `json:"country_name"`
	CountryCode     string      `json:"country_code"`
	Ports           []fofa.Port `json:"ports"`
	UpdateTime      string      `json:"update_time"`
	Domain          []string    `json:"domain"`
}

func (r *HostAggs) Query(req *service.Request) (*HostAggsResult, error) {
	bytes, err := r.fofa.request(req)
	if err != nil {
		return nil, err
	}
	bodyStr := string(bytes)
	isError := gjson.Get(bodyStr, "error").Bool()
	if isError {
		errMsg := gjson.Get(bodyStr, "errmsg").String()
		return nil, errors.New(errMsg)
	}
	var aggs HostAggsResult
	err = json.Unmarshal(bytes, &aggs)
	if err != nil {
		return nil, err
	}
	return &aggs, nil
}
