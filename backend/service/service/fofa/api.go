package fofa

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	service2 "fine/backend/service/service"
	"github.com/tidwall/gjson"
	"io"

	"fine/backend/service/model/fofa"
	"fine/backend/utils"
	"fmt"
	"net/http"
	netUrl "net/url"
	"strconv"
	"strings"
)

type Req struct {
	HttpMethod  string
	ApiPath     string
	Body        interface{}
	QueryParams *service2.QueryParams
	//PathParams  *plugin.PathParams
}

type Result struct {
	Query    string       `json:"query"`
	Total    int64        `json:"total"`
	PageNum  int          `json:"pageNum"`
	PageSize int          `json:"pageSize"`
	Items    []*fofa.Item `json:"items"`
}

func (r *Fofa) Get(req *GetDataReq) (*Result, error) {
	req.req.QueryParams.Set("key", r.key)
	var fields = req.req.QueryParams.Get("fields")
	var fieldList = strings.Split(fields, ",")
	if fields != "" {
		for _, field := range fieldList {
			if _, ok := FieldMap[field]; !ok {
				return nil, errors.New("错误的查询字段:" + field)
			}
		}
	}
	url := fmt.Sprintf("%v?%s", FofaApiUrl, req.req.QueryParams.Encode())
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}
	body, err := io.ReadAll(response.Body)
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
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil {
		return nil, err
	}
	if tmpResponse.Error {
		return nil, errors.New(tmpResponse.ErrMsg)
	}

	items := gjson.Get(string(body), "results").Array()

	// 把不带键的 [[],[]...] 转成带键的 [{},{}...]
	formatItems, err := r.formatItems(items, fields)
	if err != nil {
		return nil, err
	}

	var resp Result
	resp.Items = formatItems
	resp.Query = tmpResponse.Query
	resp.PageNum = tmpResponse.PageNum
	size, _ := strconv.Atoi(req.req.QueryParams.Get("size"))
	resp.PageSize = size
	resp.Total = tmpResponse.Total
	if resp.Items == nil {
		resp.Items = make([]*fofa.Item, 0)
	}
	return &resp, nil
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
	params := netUrl.Values{}
	params.Add("key", r.key)
	url := fmt.Sprintf("%v?%s", FofaUserApiUrl, params.Encode())
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
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

func (r *StatisticalAggs) Fields(fields string) *StatisticalAggs {
	r.fields = fields
	return r
}

func (r *StatisticalAggs) Query(query string) (*StatisticalAggsResult, error) {
	r.query = query
	params := netUrl.Values{}
	params.Set("key", r.fofa.key)
	params.Set("fields", r.fields)
	params.Set("qbase64", base64.StdEncoding.EncodeToString([]byte(r.query)))
	u := fmt.Sprintf("https://fofa.info/api/v1/search/stats?%s", params.Encode())
	request, err := http.NewRequest("GET", u, nil)
	response, err := r.fofa.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}
	bytes, err := io.ReadAll(response.Body)
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

func (r *HostAggs) Detail(detail bool) *HostAggs {
	r.detail = detail
	return r
}

func (r *HostAggs) Host(host string) (*HostAggsResult, error) {
	detail := "false"
	if r.detail {
		detail = "true"
	}
	r.host = host
	params := netUrl.Values{}
	params.Set("key", r.fofa.key)
	params.Set("detail", detail)
	u := fmt.Sprintf("https://fofa.info/api/v1/host/%s?%s", r.host, params.Encode())
	request, err := http.NewRequest("GET", u, nil)
	response, err := r.fofa.http.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}
	bytes, err := io.ReadAll(response.Body)
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
