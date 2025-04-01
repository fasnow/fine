package icp

import (
	"crypto/md5"
	"encoding/base64"
	"errors"
	"fine/backend/application"
	"fine/backend/service/model/icp"
	"fine/backend/service/service"
	"fine/backend/utils"
	"fmt"
	"github.com/fasnow/goproxy"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"
)

var (
	IllegalRequestError  = errors.New("请求非法,已阻止,请及时刷新页面")
	TokenExpiredError    = errors.New("token过期,请及时刷新页面")
	CaptchaMismatchError = errors.New("请求非法,验证码不匹配!!")
)

var (
	referer     string // 请求头必须要有该字段
	getTokenUrl string // getTokenUrl 获取token的url，会返回一个token(bussiness)和refreshToken(refresh)
	queryUrl    string // queryUrl 查询的url
)

func init() {
	var t1, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9iZWlhbi5taWl0Lmdvdi5jbi8=") // 不难理解
	referer = string(t1)
	var t2, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9obHdpY3Bmd2MubWlpdC5nb3YuY24vaWNwcHJvamVjdF9xdWVyeS9hcGkvYXV0aA==")                                         // 不难理解
	var t3, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9obHdpY3Bmd2MubWlpdC5nb3YuY24vaWNwcHJvamVjdF9xdWVyeS9hcGkvaWNwQWJicmV2aWF0ZUluZm8vcXVlcnlCeUNvbmRpdGlvbi8=") // 不难理解
	getTokenUrl = string(t2)
	queryUrl = string(t3)
}

type ICP struct {
	http         *http.Client
	token        string
	refreshToken string
	expireIn     int64
	sign         string
	mutex        sync.Mutex
}

var ServiceTypes = []string{
	"1", // 网站
	"6", // APP
	"7", // 小程序
	"8", // 快应用
}

type Result struct {
	PageNum  int         `json:"pageNum"`
	PageSize int         `json:"pageSize"`
	Total    int         `json:"total"`
	Items    []*icp.Item `json:"items"`
}

func NewClient() *ICP {
	return &ICP{
		http: &http.Client{
			Timeout: application.DefaultApp.Config.Timeout, //  必须设置一个超时
		},
		sign: "eyJ0eXBlIjozLCJleHREYXRhIjp7InZhZnljb2RlX2ltYWdlX2tleSI6IjBlNzg0YzM4YmQ1ZTQwNWY4NzQyMTdiN2E5MjVjZjdhIn0sImUiOjE3MzA5NzkzNTgwMDB9.kyklc3fgv9Ex8NnlmkYuCyhe8vsLrXBcUUkEawZryGc",
	}
}

func (r *ICP) UseProxyManager(manager *goproxy.GoProxy) {
	r.http = manager.GetClient()
}

func (r *ICP) SetTokenFromRemote() error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	timeStampInt := time.Now().UnixMilli()
	if r.expireIn > timeStampInt {
		return nil
	}
	timeStampStr := strconv.FormatInt(timeStampInt, 10)
	req := service.NewRequest()
	req.Method = "POST"
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("Referer", referer)
	req.Header.Add("User-Agent", goproxy.DefaultUA)
	req.Header.Set("Cookie", "__jsluid_s = 6452684553c30942fcb8cff8d5aa5a5b")
	req.BodyParams.Set("authKey", fmt.Sprintf("%x", md5.Sum([]byte("testtest"+timeStampStr))))
	req.BodyParams.Set("timeStamp", timeStampStr)
	req.BodyParams.Decorate(req)
	response, err := req.Do(r.http, getTokenUrl)
	if err != nil {
		return err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return err
	}

	// 被ban或者服务器出错
	if response.StatusCode != 200 {
		return errors.New(fmt.Sprintf("%v\n%v", response.StatusCode, string(body)))
	}

	var stringBody = string(body)
	var code = gjson.Get(stringBody, "code").Int()
	if code != 200 {
		return errors.New(fmt.Sprintf("%v\n%v", response.StatusCode, string(body)))
	}
	r.expireIn = timeStampInt + gjson.Get(stringBody, "params.expire").Int()
	r.token = gjson.Get(stringBody, "params.bussiness").String()
	r.refreshToken = gjson.Get(stringBody, "params.refresh").String()
	return nil
}

func (r *ICP) request(req *service.Request) ([]byte, error) {
	req.Header.Set("Token", r.token)
	req.Header.Set("Sign", r.sign)
	return req.Fetch(r.http, queryUrl, func(response *http.Response) error {
		if response.StatusCode != 200 {
			return errors.New(response.Status)
		}
		return nil
	})
}

func (r *ICP) Query(req *service.Request) (*Result, error) {
	bytes, err := r.request(req)
	if err != nil {
		return nil, err
	}
	bodyStr := string(bytes)
	code := gjson.Get(bodyStr, "code").Int()

	//{ "success": false, "code": 401, "msg": "请求非法,验证码不匹配!!" }
	//{ "success": false, "code": 401, "msg": "token过期,请及时刷新页面" }
	//{ "success": false, "code": 401, "msg": "请求非法,已阻止,请及时刷新页面" }
	msg := gjson.Get(bodyStr, "msg").String()
	if code != 200 {
		return nil, errors.New(msg)
	}

	pageNum := gjson.Get(bodyStr, "params.pageNum").Int()
	pageSize := gjson.Get(bodyStr, "params.pageSize").Int()
	total := gjson.Get(bodyStr, "params.total").Int()
	list := gjson.Get(bodyStr, "params.list").Array()

	serviceTypeName := ""
	switch req.BodyMap["serviceType"] {
	case "1":
		serviceTypeName = "网站"
		break
	case "6":
		serviceTypeName = "APP"
		break
	case "7":
		serviceTypeName = "小程序"
		break
	case "8":
		serviceTypeName = "快应用"
		break
	default:
	}

	items := make([]*icp.Item, 0)
	for _, item := range list {
		itemStr := item.String()
		serviceName := ""
		if req.BodyMap["serviceType"] == "1" {
			serviceName = gjson.Get(itemStr, "domain").String()
		} else {
			serviceName = gjson.Get(itemStr, "serviceName").String()
		}
		tt := &icp.Item{
			ServiceName:      serviceName,
			LeaderName:       gjson.Get(itemStr, "leaderName").String(),
			NatureName:       gjson.Get(itemStr, "natureName").String(),
			ServiceLicence:   gjson.Get(itemStr, "serviceLicence").String(),
			UnitName:         gjson.Get(itemStr, "unitName").String(),
			UpdateRecordTime: gjson.Get(itemStr, "updateRecordTime").String(),
			ServiceType:      serviceTypeName,
		}
		items = append(items, tt)
	}

	return &Result{
		PageNum:  int(pageNum),
		PageSize: int(pageSize),
		Items:    items,
		Total:    int(total),
	}, nil
}

func (r *ICP) Export(items []*icp.Item, filename string) error {
	var data [][]any
	headers := append([]any{"序号"}, []any{"企业名称", "备案内容",
		"备案号", "备案类型", "备案法人", "单位性质", "审核日期"}...)
	data = append(data, headers)
	for index, item := range items {
		var tmpItem = []any{
			index + 1,
			item.UnitName,
			item.ServiceName,
			item.ServiceLicence,
			item.ServiceType,
			item.LeaderName,
			item.NatureName,
			item.UpdateRecordTime}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}
