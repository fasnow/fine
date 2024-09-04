package quake

import (
	"errors"
	"fine/backend/logger"
	"fine/backend/service/model/quake"
	"fine/backend/service/service"
	"fine/backend/utils"
	"github.com/buger/jsonparser"
	"github.com/goccy/go-json"
	"io"
	"net/http"
	"strconv"
	"strings"
)

type RSDQueryResult struct {
	Items []quake.RealtimeServiceItem `json:"items"` //用指针wails会无法生成正确的映射
	Page  int                         `json:"page"`
	Size  int                         `json:"size"`
	Total int64                       `json:"total"`
}

//type Component struct {
//	ProductLevel   string   `json:"product_level"`
//	ProductType    []string `json:"product_type"`
//	ProductVendor  string   `json:"product_vendor"`
//	ProductNameCn  string   `json:"product_name_cn"`
//	ProductNameEn  string   `json:"product_name_en"`
//	ID             string   `json:"id"`
//	Number        string   `json:"version"`
//	ProductCatalog []string `json:"product_catalog"`
//}

//type ServiceItem struct {
//	Response string `json:"response"`
//	//TLSJarm  struct { //该字段为string或者struct
//	//	JarmHash string   `json:"jarm_hash"`
//	//	JarmAns  []string `json:"jarm_ans"`
//	//} `json:"tls-jarm"`
//	ResponseHash string `json:"response_hash"`
//	Name         string `json:"name"`
//	HTTP         struct {
//		Server     string `json:"server"`
//		StatusCode any    `json:"status_code"` //200 or 暂无权限
//		Title      string `json:"title"`
//		Host       string `json:"host"`
//		Path       string `json:"path"`
//	} `json:"http"`
//	Cert string `json:"cert"`
//}
//
//type Location struct {
//	Owner       string    `json:"owner"`
//	ProvinceCn  string    `json:"province_cn"`
//	ProvinceEn  string    `json:"province_en"`
//	Isp         string    `json:"isp"` //运营商
//	CountryEn   string    `json:"country_en"`
//	DistrictCn  string    `json:"district_cn"`
//	Gps         []float64 `json:"gps"`
//	StreetCn    string    `json:"street_cn"`
//	CityEn      string    `json:"city_en"`
//	DistrictEn  string    `json:"district_en"`
//	CountryCn   string    `json:"country_cn"`
//	StreetEn    string    `json:"street_en"`
//	CityCn      string    `json:"city_cn"`
//	CountryCode string    `json:"country_code"`
//	Asname      string    `json:"asname"`
//	SceneCn     string    `json:"scene_cn"`
//	SceneEn     string    `json:"scene_en"`
//	Radius      float64   `json:"radius"`
//}
//type RealtimeServiceItem struct {
//	Components []Component `json:"components"`
//	Org        string      `json:"org"` //自治域
//	IP         string      `json:"ip"`
//	OsVersion  string      `json:"os_version"`
//	IsIpv6     bool        `json:"is_ipv6"`
//	Transport  string      `json:"transport"`
//	Hostname   string      `json:"hostname"`
//	Port       int         `json:"port"`
//	Service    ServiceItem `json:"service"`
//	Domain     string      `json:"domain"`
//	OsName     string      `json:"os_name"`
//	Location   Location    `json:"location"`
//	Time       string      `json:"time"`
//	Asn        int         `json:"asn"` //自治域编号
//}

func (r *realtimeData) Service(req *GetRealtimeDataReq) (*RSDQueryResult, error) {
	postOptions, _ := json.Marshal(req.req.Body)
	postData := strings.NewReader(string(postOptions))
	request, err := http.NewRequest("POST", QuakeRealTimeServiceDataApiUrl, postData)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	byteData, page, size, total, err := r.client.parser(request)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	var resultItems []quake.RealtimeServiceItem
	err = json.Unmarshal(byteData, &resultItems)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	result := &RSDQueryResult{
		Items: resultItems,
		Page:  page,
		Size:  size,
		Total: total,
	}
	if result.Items == nil {
		result.Items = make([]quake.RealtimeServiceItem, 0)
	}
	return result, nil
}

type RHDQueryResult struct {
	Items []*quake.RealtimeHostItem `json:"items"`
	Page  int                       `json:"page"`
	Size  int                       `json:"size"`
	Total int64                     `json:"total"`
}

//type RHDQueryResultItem struct {
//	Components []struct {
//		ProductLevel   string   `json:"product_level"`
//		ProductType    []string `json:"product_type"`
//		ProductVendor  string   `json:"product_vendor"`
//		ProductNameCn  string   `json:"product_name_cn"`
//		ProductNameEn  string   `json:"product_name_en"`
//		ID             string   `json:"id"`
//		Number        string   `json:"version"`
//		ProductCatalog []string `json:"product_catalog"`
//	} `json:"components"`
//	Org       string `json:"org"` //自治域
//	IP        string `json:"ip"`
//	OsVersion string `json:"os_version"`
//	IsIpv6    bool   `json:"is_ipv6"`
//	Transport string `json:"transport"`
//	Hostname  string `json:"hostname"`
//	Port      int    `json:"port"`
//	Service   struct {
//		Response string `json:"response"`
//		TLSJarm  struct {
//			JarmHash string   `json:"jarm_hash"`
//			JarmAns  []string `json:"jarm_ans"`
//		} `json:"tls-jarm"`
//		ResponseHash string `json:"response_hash"`
//		Name         string `json:"name"`
//		HTTP         struct {
//			Server     string `json:"server"`
//			StatusCode int    `json:"status_code"`
//			Title      string `json:"title"`
//			Host       string `json:"host"`
//			Path       string `json:"path"`
//		} `json:"http"`
//		Cert string `json:"cert"`
//	} `json:"service"`
//	Domain   string `json:"domain"`
//	OsName   string `json:"os_name"`
//	Location struct {
//		Owner       string    `json:"owner"`
//		ProvinceCn  string    `json:"province_cn"`
//		ProvinceEn  string    `json:"province_en"`
//		Isp         string    `json:"isp"` //运营商
//		CountryEn   string    `json:"country_en"`
//		DistrictCn  string    `json:"district_cn"`
//		Gps         []float64 `json:"gps"`
//		StreetCn    string    `json:"street_cn"`
//		CityEn      string    `json:"city_en"`
//		DistrictEn  string    `json:"district_en"`
//		CountryCn   string    `json:"country_cn"`
//		StreetEn    string    `json:"street_en"`
//		CityCn      string    `json:"city_cn"`
//		CountryCode string    `json:"country_code"`
//		Asname      string    `json:"asname"`
//		SceneCn     string    `json:"scene_cn"`
//		SceneEn     string    `json:"scene_en"`
//		Radius      float64   `json:"radius"`
//	} `json:"location"`
//	Time time.Time `json:"time"`
//	Asn  int       `json:"asn"` //自治域编号
//}

func (r *realtimeData) Host(req *GetRealtimeDataReq) (*RHDQueryResult, error) {
	postOptions, _ := json.Marshal(req.req.Body)
	postData := strings.NewReader(string(postOptions))
	request, err := http.NewRequest("POST", QuakeRealTimeServiceDataApiUrl, postData)
	if err != nil {
		return nil, err
	}
	byteData, page, size, total, err := r.client.parser(request)
	if err != nil {
		return nil, err
	}
	var resultItems []*quake.RealtimeHostItem
	err = json.Unmarshal(byteData, &resultItems)
	if err != nil {
		return nil, err
	}
	result := &RHDQueryResult{
		Items: resultItems,
		Page:  page,
		Size:  size,
		Total: total,
	}
	if result.Items == nil {
		result.Items = make([]*quake.RealtimeHostItem, 0)
	}
	return result, nil
}

func (d *deepData) Service() {

}

func (d *deepData) Host() {

}

func (a *aggregationData) Service() {

}

func (a *aggregationData) Host() {

}

func (q *Quake) parser(request *http.Request) ([]byte, int, int, int64, error) {
	body, err2 := q.send(request)
	if err2 != nil {
		return nil, 0, 0, 0, err2
	}
	tmpCode, valueType, _, err := jsonparser.Get(body, "code")
	if err != nil {
		return nil, 0, 0, 0, service.UnexpectedStructureError
	}
	if valueType == jsonparser.String {
		message, err := jsonparser.GetString(body, "message")
		if err != nil {
			return nil, 0, 0, 0, service.UnexpectedStructureError
		}
		return nil, 0, 0, 0, errors.New(message)
	}
	code, _ := strconv.Atoi(string(tmpCode))
	if code != 0 {
		message, err := jsonparser.GetString(body, "message")
		if err != nil {
			return nil, 0, 0, 0, service.UnexpectedStructureError
		}
		return nil, 0, 0, 0, errors.New(message)
	}
	tmpData, _, _, err := jsonparser.Get(body, "data")
	if err != nil {
		return nil, 0, 0, 0, service.UnexpectedStructureError
	}
	total, _ := jsonparser.GetInt(body, "meta", "pagination", "total")
	page, _ := jsonparser.GetInt(body, "meta", "pagination", "page_index")
	size, _ := jsonparser.GetInt(body, "meta", "pagination", "page_size")
	return tmpData, int(page), int(size), total, nil
}

func (f *faviconSimilarityData) Get(faviconHash string, similar float64, size int, ignoreCache bool, startTime string, endTime string) ([]*map[string]any, error) {
	var req *http.Request
	var result = make([]*map[string]any, 0)
	var param map[string]any
	if faviconHash == "" {
		return nil, errors.New("param \"faviconHash\" is needed and can't be empty")
	}
	param["similar"] = similar
	param["favicon_hash"] = faviconHash
	param["ignore_cache"] = ignoreCache
	if size <= 0 {
		size = 10
	}
	param["size"] = size
	if startTime != "" {
		param["start_time"] = startTime
	}
	if endTime != "" {
		param["end_time"] = endTime
	}

	data, _ := json.Marshal(param)
	reqBody := strings.NewReader(string(data))
	req, _ = http.NewRequest("POST", QuakeFaviconSimilarityDataApiUrl, reqBody)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-QuakeToken", f.client.key)
	response, err := f.client.Http.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	if response.StatusCode == 401 {
		return nil, errors.New("invalid quake key")
	}
	if response.StatusCode != 200 {
		return nil, errors.New(string(body))
	}
	code, err := jsonparser.GetInt(body, "Code")
	if err != nil && err.Error() == "Key path not found" {
		return nil, errors.New("quake query failed:" + service.UnexpectedResponse)
	}
	message, _ := jsonparser.GetString(body, "message")
	if err != nil || code != 0 {
		return nil, errors.New("quake return error message:" + message)
	}
	data, _, _, err = jsonparser.Get(body, "data")
	if err != nil {
		return nil, err
	}
	json.Unmarshal(data, &result)
	if len(result) == 0 {
		return nil, nil
	}
	return result, nil
}

type ServiceFieldType string

const (
	IP                        ServiceFieldType = "ip"
	port                      ServiceFieldType = "port"
	hostname                  ServiceFieldType = "hostname"
	transport                 ServiceFieldType = "transport"
	asn                       ServiceFieldType = "asn"
	org                       ServiceFieldType = "org"
	serviceName               ServiceFieldType = "service.name"
	locationCountryCn         ServiceFieldType = "location.country_cn"
	locationProvinceCn        ServiceFieldType = "location.province_cn"
	locationCityCn            ServiceFieldType = "location.city_cn"
	serviceHttpHost           ServiceFieldType = "service.http.host"
	timeStamp                 ServiceFieldType = "time"
	serviceHttpTitle          ServiceFieldType = "service.http.title"
	serviceResponse           ServiceFieldType = "service.response"
	serviceCert               ServiceFieldType = "service.cert"
	componentsProductCatalog  ServiceFieldType = "components.product_catalog"
	componentsProductType     ServiceFieldType = "components.product_type"
	componentsProductLevel    ServiceFieldType = "components.product_level"
	componentsProductVendor   ServiceFieldType = "components.product_vendor"
	locationCountryEn         ServiceFieldType = "location.country_en"
	locationCityEn            ServiceFieldType = "location.province_en"
	locationDistrictEn        ServiceFieldType = "location.district_en"
	locationDistrictCn        ServiceFieldType = "location.district_cn"
	locationIsp               ServiceFieldType = "location.isp"
	serviceHttpBody           ServiceFieldType = "service.http.body"
	componentsProductNamCn    ServiceFieldType = "components.product_name_cn"
	componentsVersion         ServiceFieldType = "components.version"
	serviceHttpInfomationMail ServiceFieldType = "service.http.infomation.mail"
	serviceHttpFaviconHash    ServiceFieldType = "service.http.favicon.hash"
	serviceHttpFaviconData    ServiceFieldType = "service.http.favicon.data"
	domain                    ServiceFieldType = "domain"
	serviceHttpStatusCode     ServiceFieldType = "service.http.status_code"
)

func (f *filterField) Service() ([]*string, error) {
	return f.parser(Service)
}

func (f *filterField) Host() ([]*string, error) {
	return f.parser(Host)
}

func (f *filterField) AggregationService() ([]*string, error) {
	return f.parser(AggregationService)
}

func (f *filterField) AggregationHost() ([]*string, error) {
	return f.parser(AggregationHost)
}

func (f *filterField) parser(fieldType QueryType) ([]*string, error) {
	var req *http.Request
	switch fieldType {
	case Service:
		req, _ = http.NewRequest("GET", QuakeServiceDataFilterFieldApiUrl, nil)
		break
	case AggregationService:
		req, _ = http.NewRequest("GET", QuakeAggregationServiceDataApiUrl, nil)
		break
	case Host:
		req, _ = http.NewRequest("GET", QuakeHostDataFilterFieldApiUrl, nil)
		break
	case AggregationHost:
		req, _ = http.NewRequest("GET", QuakeAggregationHostDataApiUrl, nil)
		break
	default:
		return nil, service.UnexpectedFieldTypeError
	}
	body, _, _, _, err := f.client.parser(req)
	if err != nil {
		return nil, err
	}
	var tmp []*string
	err = json.Unmarshal(body, &tmp)
	if err != nil {
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	return tmp, nil
}

type User struct {
	ID   string `json:"id"`
	User struct {
		ID       string   `json:"id"`
		Username string   `json:"username"`
		Fullname string   `json:"fullname"`
		Email    any      `json:"email"`
		Group    []string `json:"group"`
	} `json:"user"`
	Baned                bool   `json:"baned"`
	BanStatus            string `json:"ban_status"`
	MonthRemainingCredit int    `json:"month_remaining_credit"`
	ConstantCredit       int    `json:"constant_credit"`
	Credit               int    `json:"credit"`
	PersistentCredit     int    `json:"persistent_credit"`
	FreeQueryAPICount    int    `json:"free_query_api_count"`
	AvatarID             string `json:"avatar_id"`
	Token                string `json:"token"`
	MobilePhone          string `json:"mobile_phone"`
	Source               string `json:"source"`
	Time                 string `json:"time"`
	Disable              struct {
		DisableTime any `json:"disable_time"`
		StartTime   any `json:"start_time"`
	} `json:"disable"`
	PrivacyLog struct {
		QuakeLogStatus bool `json:"quake_log_status"`
		QuakeLogTime   any  `json:"quake_log_time"`
		AnonymousModel bool `json:"anonymous_model"`
		Status         bool `json:"status"`
		Time           any  `json:"time"`
	} `json:"privacy_log"`
	EnterpriseInformation struct {
		Name   any    `json:"name"`
		Email  any    `json:"email"`
		Status string `json:"status"`
	} `json:"enterprise_information"`
	InvitationCodeInfo struct {
		Code                string `json:"code"`
		InviteAcquireCredit int    `json:"invite_acquire_credit"`
		InviteNumber        int    `json:"invite_number"`
	} `json:"invitation_code_info"`
	IsCashedInvitationCode bool `json:"is_cashed_invitation_code"`
	RoleValidity           struct {
		NamingFailed any `json:"注册用户"`
	} `json:"role_validity"`
	PersonalInformationStatus bool        `json:"personal_information_status"`
	Role                      []*UserRole `json:"role"`
}

type UserRole struct {
	Fullname string `json:"fullname"`
	Priority int    `json:"priority"`
	Credit   int    `json:"credit"`
}

func (q *Quake) User() (*User, error) {
	req, _ := http.NewRequest("GET", QuakeUserApiUrl, nil)
	//req.Header.Set("Content-Type", "application/json")
	body, err := q.send(req)
	if err != nil {
		return nil, err
	}
	var tmpResponse struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		User    User   `json:"data"`
		Meta    struct {
		} `json:"meta"`
	}
	err = json.Unmarshal(body, &tmpResponse)
	if err != nil && err.Error() == service.WrongJsonFormat {
		return nil, errors.New(service.QuakeUnexpectedJsonResponse)
	} else if err != nil {
		return nil, errors.New(service.QuakeUnexpectedJsonResponseOfUser)
	}
	return &tmpResponse.User, nil
}

func (q *Quake) Export(items []quake.RealtimeServiceItem, filename string) error {
	var headers = []any{"ID", "IP", "域名", "主机", "端口", "协议", "响应码", "网页标题", "组件", "网站路径", "中间件", "证书", "操作系统", "运营商", "地理位置", "场景", "自治域", "自治域编号", "更新时间"}
	var data = [][]any{headers}
	for i, item := range items {
		var component []string
		//for _, comp := range item.Components {
		//	component = append(component, fmt.Sprintf("%s %s", comp.ProductNameEn, comp.Number))
		//}
		var locationCn []string
		var locationEn []string
		{
			if item.Location.CountryCn != "" {
				locationCn = append(locationCn, item.Location.CountryCn)
			}
			if item.Location.ProvinceCn != "" {
				locationCn = append(locationCn, item.Location.ProvinceCn)
			}
			if item.Location.CityCn != "" {
				locationCn = append(locationCn, item.Location.CityCn)
			}
			if item.Location.StreetCn != "" {
				locationCn = append(locationCn, item.Location.StreetCn)
			}
			if item.Location.CountryEn != "" {
				locationEn = append(locationEn, item.Location.CountryEn)
			}
			if item.Location.ProvinceEn != "" {
				locationEn = append(locationEn, item.Location.ProvinceEn)
			}
			if item.Location.CityEn != "" {
				locationEn = append(locationEn, item.Location.CityEn)
			}
			if item.Location.StreetEn != "" {
				locationEn = append(locationEn, item.Location.StreetEn)
			}
		}
		var tmpItem = []any{
			i + 1,
			item.IP,
			item.Domain,
			item.Hostname,
			item.Port,
			item.Service.Name,
			item.Service.HTTP.StatusCode,
			item.Service.HTTP.Title,
			strings.Join(component, "\n"),
			item.Service.HTTP.Path,
			item.Service.HTTP.Server,
			item.Service.Cert,
			strings.Join([]string{item.OsName, item.OsVersion}, " "),
			item.Location.Isp,
			locationCn,
			locationEn,
			item.Org,
			item.Asn,
			item.Time,
		}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}

// 发送请求并返回响应体
func (q *Quake) send(request *http.Request) ([]byte, error) {
	request.Header.Set("X-QuakeToken", q.key)
	if request.Method == "POST" {
		request.Header.Set("Content-Type", "application/json")
	}
	response, err := q.Http.Do(request)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	if response.StatusCode == 401 {
		return nil, errors.New("invalid quake key")
	}
	if response.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(response.StatusCode))
	}
	if string(body) == service.QuakeUnauthorized {
		return nil, errors.New(service.QuakeInvalidKey)
	}
	return body, nil
}
