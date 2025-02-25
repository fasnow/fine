package icp

import (
	"encoding/base64"
	"errors"
	"fine/backend/application"
	"fine/backend/proxy/v2"
	"fine/backend/service/model/icp"
	"net/http"
	"sync"
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
	page         int
	size         int
	serviceType  string // 1,6,7,8 网站，app，小程序，快应用
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

func (r *ICP) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}
