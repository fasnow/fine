package icp

import (
	"bytes"
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fine/backend/logger"
	"fine/backend/service/model/icp"
	"fine/backend/service/service"
	"fmt"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
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
	var t1, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9iZWlhbi5taWl0Lmdvdi5jbi8=")
	referer = string(t1)
	var t2, _ = base64.StdEncoding.DecodeString("aHR0cHM6Ly9obHdpY3Bmd2MubWlpdC5nb3YuY24=")
	var host = string(t2)
	getTokenUrl = host + "/icpproject_query/api/auth"
	queryUrl = host + "/icpproject_query/api/icpAbbreviateInfo/queryByCondition/"
}

type ICP struct {
	Http         *http.Client
	token        string
	refreshToken string
	expireIn     int64
	sign         string
	page         int
	size         int
	serviceType  string // 1,6,7,8 网站，app，小程序，快应用
}

type Struct2 struct {
	Name string
}

type Result struct {
	PageNum  int         `json:"pageNum"`
	PageSize int         `json:"pageSize"`
	Total    int         `json:"total"`
	Items    []*icp.Item `json:"items"`
}

func NewClient() *ICP {
	return &ICP{
		Http: &http.Client{},
		sign: "eyJ0eXBlIjozLCJleHREYXRhIjp7InZhZnljb2RlX2ltYWdlX2tleSI6IjBlNzg0YzM4YmQ1ZTQwNWY4NzQyMTdiN2E5MjVjZjdhIn0sImUiOjE3MzA5NzkzNTgwMDB9.kyklc3fgv9Ex8NnlmkYuCyhe8vsLrXBcUUkEawZryGc",
	}
}

func (i *ICP) setTokenFromRemote() error {
	var req *http.Request
	timeStampInt := time.Now().UnixMilli()
	timeStampStr := strconv.FormatInt(timeStampInt, 10)
	authKey := fmt.Sprintf("%x", md5.Sum([]byte("testtest"+timeStampStr)))
	postData := url.Values{}
	postData.Set("authKey", authKey)
	postData.Set("timeStamp", timeStampStr)
	req, _ = http.NewRequest("POST", getTokenUrl, strings.NewReader(postData.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("Referer", referer)
	req.Header.Set("Cookie", "__jsluid_s = 6452684553c30942fcb8cff8d5aa5a5b")
	response, err := i.Http.Do(req)
	if err != nil {
		logger.Info(err.Error())
		return err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		logger.Info(err.Error())
		return err
	}
	// 被ban或者服务器出错
	if response.StatusCode != 200 {
		return errors.New(fmt.Sprintf("响应状态码：%v，响应体：%v", response.StatusCode, string(body)))
	}
	var stringBody = string(body)
	var code = gjson.Get(stringBody, "code").Int()
	if code != 200 {
		return errors.New(fmt.Sprintf("响应状态码：%v，响应体：%v", response.StatusCode, stringBody))
	}
	i.expireIn = timeStampInt + gjson.Get(stringBody, "params.expire").Int()
	i.token = gjson.Get(stringBody, "params.bussiness").String()
	i.refreshToken = gjson.Get(stringBody, "params.refresh").String()
	return nil
}

func (i *ICP) PageNum(page int) *ICP {
	i.page = page
	return i
}

func (i *ICP) PageSize(size int) *ICP {
	i.size = size
	return i
}

func (i *ICP) ServiceType(serviceType string) *ICP {
	i.serviceType = serviceType
	return i
}

func (i *ICP) Query(unitName string) (*Result, error) {
	unitName = strings.TrimSpace(unitName)
	if unitName == "" {
		return nil, service.UnexpectedQueryStatementError
	}
	if i.page <= 0 {
		i.page = 1
	}
	if i.size <= 0 {
		i.size = 40
	}
	postData := map[string]string{
		"pageNum":     strconv.Itoa(i.page),
		"pageSize":    strconv.Itoa(i.size),
		"unitName":    unitName,
		"serviceType": i.serviceType,
	}
	bytesData, _ := json.Marshal(postData)
	req, err := http.NewRequest("POST", queryUrl, bytes.NewReader(bytesData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Token", i.token)
	req.Header.Set("Sign", i.sign)
	req.Header.Set("Referer", referer)
	req.Header.Set("Cookie", "__jsluid_s=8e209cf6c7c40f530a300ac8dd0eb6c7")
	response, err := i.Http.Do(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	bodyStr := string(body)

	if response.StatusCode == 403 {
		return nil, errors.New("被ban: " + bodyStr)
	}
	if response.StatusCode != 200 {
		return nil, errors.New("其他错误: " + bodyStr)
	}

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
	if i.serviceType == "1" {
		serviceTypeName = "网站"
	} else if i.serviceType == "6" {
		serviceTypeName = "APP"
	} else if i.serviceType == "7" {
		serviceTypeName = "小程序"
	} else if i.serviceType == "8" {
		serviceTypeName = "快应用"
	}
	items := make([]*icp.Item, 0)
	for _, item := range list {
		itemStr := item.String()
		serviceName := ""
		if i.serviceType == "1" {
			serviceName = gjson.Get(itemStr, "domain").String()
		} else {
			serviceName = gjson.Get(itemStr, "serviceName").String()
		}
		t := &icp.Item{
			ServiceName:      serviceName,
			LeaderName:       gjson.Get(itemStr, "leaderName").String(),
			NatureName:       gjson.Get(itemStr, "natureName").String(),
			ServiceLicence:   gjson.Get(itemStr, "serviceLicence").String(),
			UnitName:         gjson.Get(itemStr, "unitName").String(),
			UpdateRecordTime: gjson.Get(itemStr, "updateRecordTime").String(),
			ServiceType:      serviceTypeName,
		}
		items = append(items, t)
	}

	return &Result{
		PageNum:  int(pageNum),
		PageSize: int(pageSize),
		Items:    items,
		Total:    int(total),
	}, nil
}
