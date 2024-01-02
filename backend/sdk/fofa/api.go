package fofa

import (
	"errors"
	sdk2 "fine-server/sdk"
	"fine-server/utils"
	"fmt"
	"github.com/buger/jsonparser"
	"github.com/fasnow/ghttp"
	"github.com/goccy/go-json"
	"net/http"
	netUrl "net/url"
	"strconv"
	"strings"
)

type Req struct {
	HttpMethod  string
	ApiPath     string
	Body        interface{}
	QueryParams *sdk2.QueryParams
	//PathParams  *plugin.PathParams
}

type Result struct {
	Query string  `json:"query"`
	Total int64   `json:"total"`
	Page  int     `json:"page"`
	Size  int     `json:"size"`
	Items []*Item `json:"items"`
}

type Item struct {
	Ip              string `json:"ip"`               //ip	    		ip地址				权限：无
	Port            string `json:"port"`             //port				端口					权限：无
	Protocol        string `json:"protocol"`         //protocol			协议名				权限：无
	Country         string `json:"country"`          //country			国家代码				权限：无
	CountryName     string `json:"country_name"`     //country_name		国家名				权限：无
	Region          string `json:"region"`           //region			区域					权限：无
	City            string `json:"city"`             //city				城市					权限：无
	Longitude       string `json:"longitude"`        //longitude		地理位置 经度			权限：无
	Latitude        string `json:"latitude"`         //latitude			地理位置 纬度			权限：无
	AsNumber        string `json:"as_number"`        //as_number		asn编号				权限：无
	AsOrganization  string `json:"as_organization"`  //as_organization	asn组织				权限：无
	Host            string `json:"host"`             //host				主机名				权限：无
	Domain          string `json:"domain"`           //domain			域名					权限：无
	Os              string `json:"os"`               //os			    操作系统				权限：无
	Server          string `json:"server"`           //server			网站server			权限：无
	Icp             string `json:"icp"`              //icp				icp备案号			权限：无
	Title           string `json:"title"`            //title			网站标题				权限：无
	Jarm            string `json:"jarm"`             //jarm				jarm 指纹			权限：无
	Header          string `json:"header"`           //header			网站header			权限：无
	Banner          string `json:"banner"`           //banner			协议 banner			权限：无
	Cert            string `json:"cert"`             //cert				证书					权限：无
	BaseProtocol    string `json:"base_protocol"`    //base_protocol	基础协议，比如tcp/udp	权限：无
	Link            string `json:"link"`             //link				资产的URL链接			权限：无
	Product         string `json:"product"`          //product			产品名				权限：专业版本及以上
	ProductCategory string `json:"product_category"` //product_category 产品分类			    权限：专业版本及以上
	Version         string `json:"version"`          //version			版本号				权限：专业版本及以上
	LastUpdateTime  string `json:"lastupdatetime"`   //lastupdatetime	FOFA最后更新时间	    权限：专业版本及以上
	Cname           string `json:"cname"`            //cname			域名cname			权限：专业版本及以上
	IconHash        string `json:"icon_hash"`        //icon_hash		返回的icon_hash值	权限：商业版本及以上
	CertsValid      string `json:"certs_valid"`      //certs_valid		证书是否有效			权限：商业版本及以上
	CnameDomain     string `json:"cname_domain"`     //cname_domain		cname的域名			权限：商业版本及以上
	Body            string `json:"body"`             //body				网站正文内容			权限：商业版本及以上
	Icon            string `json:"icon"`             //icon				icon 图标			权限：企业会员
	Fid             string `json:"fid"`              //fid	     		fid					权限：企业会员
	Structinfo      string `json:"structinfo"`       //structinfo		结构化信息 (部分协议支持、比如elastic、mongodb)	权限：企业会员
}

func (f *Fofa) Get(req *GetDataReq) (*Result, error) {
	req.req.QueryParams.Set("email", f.email)
	req.req.QueryParams.Set("key", f.key)
	var fields = req.req.QueryParams.Get("fields")
	var fieldList = strings.Split(fields, ",")
	if fields != "" {
		for _, field := range fieldList {
			if _, ok := FieldMap[field]; !ok {
				return nil, errors.New("错误的查询字段:" + field)
			}
		}
	}
	url := fmt.Sprintf("%v?%s", sdk2.FofaApiUrl, req.req.QueryParams.Encode())
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	response, err := f.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, sdk2.NonStatusOK
	}
	body, err := ghttp.GetResponseBody(response.Body)
	if err != nil {
		return nil, err
	}
	var tmpResponse struct {
		Error           bool   `json:"error"`
		ErrMsg          string `json:"errmsg"`
		ConsumedFpoint  int    `json:"consumed_fpoint"`
		RequiredFpoints int    `json:"required_fpoints"`
		Size            int64  `json:"size"`
		Page            int    `json:"page"`
		Mode            string `json:"mode"`
		Query           string `json:"query"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, err
	}
	if tmpResponse.Error {
		return nil, errors.New(tmpResponse.ErrMsg)
	}

	items, _, _, err := jsonparser.Get(body, "results")
	if items == nil {
		return nil, sdk2.UnexpectedStructureError
	}

	// 把不带键的 [[],[]...] 转成带键的 [{},{}...]
	formatItems, err := f.formatItems(items, fields)
	if err != nil {
		return nil, err
	}

	var resp Result
	resp.Items = formatItems
	resp.Query = tmpResponse.Query
	resp.Page = tmpResponse.Page
	size, _ := strconv.Atoi(req.req.QueryParams.Get("size"))
	resp.Size = size
	resp.Total = tmpResponse.Size
	return &resp, nil
}

// Export 数据为空则不会保存任何文件
func Export(items []*Item, outputFilepath string, f ...string) error {
	if len(items) == 0 {
		return nil
	}

	//根据link去重
	seenLinks := make(map[string]struct{})
	var uniqueItems []*Item
	for _, item := range items {
		if item.Link != "" {
			if _, seen := seenLinks[item.Link]; !seen {
				uniqueItems = append(uniqueItems, item)
				seenLinks[item.Link] = struct{}{}
			} else {
				if item.Title != "" {
					for i, uniqueItem := range uniqueItems {
						if uniqueItem.Link == item.Link && uniqueItem.Title == "" {
							var tmp []*Item
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
	if len(f) > 0 {
		headers = append([]string{"id"}, f...)
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

func (f *Fofa) User() (*User, error) {
	params := netUrl.Values{}
	params.Add("Email", f.email)
	params.Add("key", f.key)
	url := fmt.Sprintf("%v?%s", sdk2.FofaUserApiUrl, params.Encode())
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	response, err := f.http.Do(request)
	if err != nil {
		return nil, err
	}
	body, err := ghttp.GetResponseBody(response.Body)
	if err != nil {
		return nil, err
	}

	var tmpResponse struct {
		User
		Error  bool   `json:"error"`
		ErrMsg string `json:"errmsg,omitempty'"`
	}
	if err = json.Unmarshal(body, &tmpResponse); err != nil {
		return nil, err
	}
	if tmpResponse.Error {
		return nil, errors.New(tmpResponse.ErrMsg)
	}
	return &tmpResponse.User, nil
}

// fofa查询结果是不带键的，会按照你查询时给定的fields的先后顺序输出，每个item是 [] 此处是把每个item附上键变成 {"field":"value"}，键名为fields的每个字段
func (f *Fofa) formatItems(items []byte, fields string) ([]*Item, error) {
	//对应两种返回结果 field不唯一和field唯一的情况
	var tmpListList [][]string //field不唯一
	var tmpStringList []string //field唯一
	err1 := json.Unmarshal(items, &tmpListList)
	err2 := json.Unmarshal(items, &tmpStringList)
	if err1 != nil && err2 != nil {
		return nil, errors.New("无法格式化数据条目：" + err1.Error())
	}
	var listLen int
	if err1 == nil {
		listLen = len(tmpListList)
	} else {
		listLen = len(tmpStringList)
	}
	var keys []string
	for _, v := range strings.Split(fields, ",") {
		if v != "" {
			keys = append(keys, v)
		}
	}
	//var newItems = make([]*map[string]string, 0)
	var newItems = make([]*Item, 0)
	//fields 为空 fofa默认按照 host,ip,port先后顺序返回
	if len(keys) == 0 {
		for i := 0; i < listLen; i++ {
			var tmpItem = &Item{
				Host: tmpListList[i][0],
				Ip:   tmpListList[i][1],
				Port: tmpListList[i][2],
			}
			newItems = append(newItems, tmpItem)
		}
	} else if len(keys) == 1 { //传入的field只有一个的话，只会返回 字符串列表 不会返回 字典列表
		for i := 0; i < listLen; i++ {
			var tmpItem = &Item{}
			switch keys[0] {
			case FieldMap["ip"]:
				tmpItem.Ip = tmpStringList[i]
				break
			case FieldMap["port"]:
				tmpItem.Port = tmpStringList[i]
				break
			case FieldMap["protocol"]:
				tmpItem.Protocol = tmpStringList[i]
				break
			case FieldMap["country"]:
				tmpItem.Country = tmpStringList[i]
				break
			case FieldMap["country_name"]:
				tmpItem.CountryName = tmpStringList[i]
				break
			case FieldMap["region"]:
				tmpItem.Region = tmpStringList[i]
				break
			case FieldMap["city"]:
				tmpItem.City = tmpStringList[i]
				break
			case FieldMap["longitude"]:
				tmpItem.Longitude = tmpStringList[i]
				break
			case FieldMap["latitude"]:
				tmpItem.Latitude = tmpStringList[i]
				break
			case FieldMap["as_number"]:
				tmpItem.AsNumber = tmpStringList[i]
				break
			case FieldMap["as_organization"]:
				tmpItem.AsOrganization = tmpStringList[i]
				break
			case FieldMap["host"]:
				tmpItem.Host = tmpStringList[i]
				break
			case FieldMap["domain"]:
				tmpItem.Domain = tmpStringList[i]
				break
			case FieldMap["os"]:
				tmpItem.Os = tmpStringList[i]
				break
			case FieldMap["server"]:
				tmpItem.Server = tmpStringList[i]
				break
			case FieldMap["icp"]:
				tmpItem.Icp = tmpStringList[i]
				break
			case FieldMap["title"]:
				tmpItem.Title = tmpStringList[i]
				break
			case FieldMap["jarm"]:
				tmpItem.Jarm = tmpStringList[i]
				break
			case FieldMap["header"]:
				tmpItem.Header = tmpStringList[i]
				break
			case FieldMap["banner"]:
				tmpItem.Banner = tmpStringList[i]
				break
			case FieldMap["cert"]:
				tmpItem.Cert = tmpStringList[i]
				break
			case FieldMap["base_protocol"]:
				tmpItem.BaseProtocol = tmpStringList[i]
				break
			case FieldMap["link"]:
				tmpItem.Link = tmpStringList[i]
				break
			case FieldMap["product"]:
				tmpItem.Product = tmpStringList[i]
				break
			case FieldMap["product_category"]:
				tmpItem.ProductCategory = tmpStringList[i]
				break
			case FieldMap["version"]:
				tmpItem.Version = tmpStringList[i]
				break
			case FieldMap["lastupdatetime"]:
				tmpItem.LastUpdateTime = tmpStringList[i]
				break
			case FieldMap["cname"]:
				tmpItem.Cname = tmpStringList[i]
				break
			case FieldMap["icon_hash"]:
				tmpItem.IconHash = tmpStringList[i]
				break
			case FieldMap["certs_valid"]:
				tmpItem.CertsValid = tmpStringList[i]
				break
			case FieldMap["cname_domain"]:
				tmpItem.CnameDomain = tmpStringList[i]
				break
			case FieldMap["body"]:
				tmpItem.Body = tmpStringList[i]
				break
			case FieldMap["icon"]:
				tmpItem.Icon = tmpStringList[i]
				break
			case FieldMap["fid"]:
				tmpItem.Fid = tmpStringList[i]
				break
			case FieldMap["structinfo"]:
				tmpItem.Structinfo = tmpStringList[i]
				break
			}
			newItems = append(newItems, tmpItem)
		}
	} else {
		for i := 0; i < listLen; i++ {
			var tmpItem = &Item{}
			for j := 0; j < len(keys); j++ {
				switch keys[j] {
				case FieldMap["ip"]:
					tmpItem.Ip = tmpListList[i][j]
					break
				case FieldMap["port"]:
					tmpItem.Port = tmpListList[i][j]
					break
				case FieldMap["protocol"]:
					tmpItem.Protocol = tmpListList[i][j]
					break
				case FieldMap["country"]:
					tmpItem.Country = tmpListList[i][j]
					break
				case FieldMap["country_name"]:
					tmpItem.CountryName = tmpListList[i][j]
					break
				case FieldMap["region"]:
					tmpItem.Region = tmpListList[i][j]
					break
				case FieldMap["city"]:
					tmpItem.City = tmpListList[i][j]
					break
				case FieldMap["longitude"]:
					tmpItem.Longitude = tmpListList[i][j]
					break
				case FieldMap["latitude"]:
					tmpItem.Latitude = tmpListList[i][j]
					break
				case FieldMap["as_number"]:
					tmpItem.AsNumber = tmpListList[i][j]
					break
				case FieldMap["as_organization"]:
					tmpItem.AsOrganization = tmpListList[i][j]
					break
				case FieldMap["host"]:
					tmpItem.Host = tmpListList[i][j]
					break
				case FieldMap["domain"]:
					tmpItem.Domain = tmpListList[i][j]
					break
				case FieldMap["os"]:
					tmpItem.Os = tmpListList[i][j]
					break
				case FieldMap["server"]:
					tmpItem.Server = tmpListList[i][j]
					break
				case FieldMap["icp"]:
					tmpItem.Icp = tmpListList[i][j]
					break
				case FieldMap["title"]:
					tmpItem.Title = tmpListList[i][j]
					break
				case FieldMap["jarm"]:
					tmpItem.Jarm = tmpListList[i][j]
					break
				case FieldMap["header"]:
					tmpItem.Header = tmpListList[i][j]
					break
				case FieldMap["banner"]:
					tmpItem.Banner = tmpListList[i][j]
					break
				case FieldMap["cert"]:
					tmpItem.Cert = tmpListList[i][j]
					break
				case FieldMap["base_protocol"]:
					tmpItem.BaseProtocol = tmpListList[i][j]
					break
				case FieldMap["link"]:
					tmpItem.Link = tmpListList[i][j]
					break
				case FieldMap["product"]:
					tmpItem.Product = tmpListList[i][j]
					break
				case FieldMap["product_category"]:
					tmpItem.ProductCategory = tmpListList[i][j]
					break
				case FieldMap["version"]:
					tmpItem.Version = tmpListList[i][j]
					break
				case FieldMap["lastupdatetime"]:
					tmpItem.LastUpdateTime = tmpListList[i][j]
					break
				case FieldMap["cname"]:
					tmpItem.Cname = tmpListList[i][j]
					break
				case FieldMap["icon_hash"]:
					tmpItem.IconHash = tmpListList[i][j]
					break
				case FieldMap["certs_valid"]:
					tmpItem.CertsValid = tmpListList[i][j]
					break
				case FieldMap["cname_domain"]:
					tmpItem.CnameDomain = tmpListList[i][j]
					break
				case FieldMap["body"]:
					tmpItem.Body = tmpListList[i][j]
					break
				case FieldMap["icon"]:
					tmpItem.Icon = tmpListList[i][j]
					break
				case FieldMap["fid"]:
					tmpItem.Fid = tmpListList[i][j]
					break
				case FieldMap["structinfo"]:
					tmpItem.Structinfo = tmpListList[i][j]
					break
				}
			}
			newItems = append(newItems, tmpItem)
		}
	}
	return newItems, nil
}
