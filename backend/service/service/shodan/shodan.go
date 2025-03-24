package shodan

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fine/backend/proxy/v2"
	"fine/backend/service/model/shodan"
	"fine/backend/service/model/shodan/properties"
	"fine/backend/service/service"
	"fmt"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
	"github.com/go-vgo/robotgo"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Shodan struct {
	key          string
	http         *http.Client
	cookie       string
	userAgent    string
	mutex        sync.Mutex
	proxyManager *proxy.Manager
	header       http.Header
}

func New(key string) *Shodan {
	s := &Shodan{
		key:    key,
		http:   proxy.DefaultHTTP,
		header: http.Header{},
	}
	s.header.Add("Connection", "keep-alive")
	s.header.Add("Referer", "https://www.shodan.io/")
	s.header.Add("Accept-Language", "zh-CN,zh;q=0.9")
	s.header.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
	return s
}

func (r *Shodan) SetAuth(token string) {
	r.key = token
}

func (r *Shodan) GenAuthQueryParam() url.Values {
	params := url.Values{}
	params.Set("key", r.key)
	return params
}

func (r *Shodan) UseProxyManager(manager *proxy.Manager) {
	r.proxyManager = manager
	r.http = manager.GetClient()
}

func (r *Shodan) bypassCFJSChallenge(url string) (http.Header, []byte, error) {
	screenWidth, screenHeight := robotgo.GetScreenSize() // 获取屏幕分辨率
	winWidth, winHeight := 800, 600                      // 设定窗口大小

	x := (screenWidth - winWidth) / 2
	y := (screenHeight - winHeight) / 2

	var proxyUrl string
	if r.proxyManager != nil {
		proxyUrl = r.proxyManager.ProxyString()
	}

	// 创建 ChromeDP 执行分配器选项
	opts := []chromedp.ExecAllocatorOption{
		chromedp.ProxyServer(proxyUrl),
		chromedp.Flag("headless", false),                                        // 禁用 Headless 模式
		chromedp.Flag("disable-blink-features", "AutomationControlled"),         // 隐藏自动化标志
		chromedp.Flag("disable-features", "Translate"),                          // 关闭翻译功能
		chromedp.Flag("window-size", fmt.Sprintf("%d,%d", winWidth, winHeight)), // 窗口大小
		chromedp.Flag("window-position", fmt.Sprintf("%d,%d", x, y)),            // 窗口位置
		chromedp.Flag("ignore-certificate-errors", true),                        // 忽略证书错误
		chromedp.Flag("disable-default-apps", true),
		chromedp.Flag("app", url), // app模式打开url
		chromedp.NoFirstRun,       // 跳过首次使用时弹出的确认提示
	}

	// 创建 ChromeDP 执行分配器
	allocCtx, cancelAlloc := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancelAlloc()

	// 创建 ChromeDP 上下文
	chromeCtx, cancelChrome := chromedp.NewContext(allocCtx)
	defer cancelChrome()

	// 用于存储目标 POST 请求的请求头和请求体
	var postHeaders = make(http.Header)
	var postBody []byte
	var success bool
	var err error

	// 监听Tab事件
	chromedp.ListenBrowser(chromeCtx, func(ev interface{}) {
		if ev, ok := ev.(*target.EventTargetDestroyed); ok {
			if c := chromedp.FromContext(chromeCtx); c != nil {
				if c.Target.TargetID == ev.TargetID {
					cancelChrome()
				}
			}
		}
	})

	// 获取cf认证
	chromedp.ListenTarget(chromeCtx, func(ev interface{}) {
		switch ev := ev.(type) {
		case *network.EventRequestWillBeSent:
			// 协程防止死锁
			go func() {
				// 检查请求方法是否为 POST
				if ev.Request.Method == "POST" && strings.Contains(ev.Request.URL, "/shodan/host/search") {
					// 存储请求头
					for k, v := range ev.Request.Headers {
						postHeaders.Add(k, v.(string))
					}

					// 存储cookie, cookie只能从Network.requestWillBeSentExtraInfo或者Network.responseReceivedExtraInfo事件中获取
					err3 := chromedp.Run(chromeCtx, chromedp.ActionFunc(func(ctx context.Context) error {
						cookies, err2 := network.GetCookies().Do(ctx)
						if err2 != nil {
							return err2
						}
						var t []string
						for _, cookie := range cookies {
							t = append(t, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
						}
						postHeaders.Add("Cookie", strings.Join(t, ";"))
						return nil
					}))
					if err3 != nil {
						return
					}

					// 存储请求体
					var t string
					for _, entry := range ev.Request.PostDataEntries {
						t += entry.Bytes
					}
					bodyBytes, err2 := base64.StdEncoding.DecodeString(t)
					if err2 != nil {
						return
					}
					postBody = bodyBytes

					// 取消上下文，退出程序
					success = true
					cancelChrome()
				}
			}()

		}
	})

	err = chromedp.Run(chromeCtx,
		// 启用网络监听
		network.Enable(),
		chromedp.ActionFunc(func(ctx context.Context) error {
			for {
				select {
				case <-chromeCtx.Done():
					return chromeCtx.Err()
				case <-time.After(1 * time.Second):
					if len(postBody) > 0 {
						return nil
					}
				}
			}
		}),
	)

	if err != nil && !success {
		return nil, nil, err
	}
	return postHeaders, postBody, nil
}

func (r *Shodan) setCFClearanceFromReqHeader(headers http.Header) {
	request, _ := http.NewRequest("GET", "https://example.com", nil)
	request.Header = headers
	_, err := request.Cookie("cf_clearance")
	if err != nil {
		return
	}
	r.header.Set("Cookie", headers.Get("Cookie"))
}

func (r *Shodan) setCFClearanceFromRespHeader(headers http.Header) {
	for _, cookie := range headers.Values("Set-Cookie") {
		t := strings.Split(cookie, ";")
		for _, s := range t {
			kv := strings.SplitN(s, "=", 2)
			if len(kv) > 1 && kv[0] == "cf_clearance" && kv[1] != "" {
				r.header.Add("Cookie", "cf_clearance="+kv[1])
				break
			}
		}
	}
}

func (r *Shodan) request(req *service.Request) ([]byte, error) {
	req.QueryParams.Set("key", r.key)
	req.Header = r.header
	response, err := req.Do(r.http, "https://api.shodan.io")
	if err != nil {
		return nil, err
	}

	// 认证信息错误
	if response.StatusCode == 401 {
		bodyBytes, err := io.ReadAll(response.Body)
		if err != nil {
			return nil, err
		}
		errMsg := gjson.Get(string(bodyBytes), "error").String()
		if errMsg == "" {
			errMsg = "invalid API key"
		}
		return nil, errors.New(errMsg)
	}

	if response.StatusCode == 400 {
		bodyBytes, err := io.ReadAll(response.Body)
		if err != nil {
			return nil, err
		}
		errMsg := gjson.Get(string(bodyBytes), "error").String()
		if errMsg == "" {
			errMsg = response.Status
		}
		return nil, errors.New(errMsg)
	}

	// cf js challenge or other
	if response.StatusCode == 403 {
		bodyBytes, err := io.ReadAll(response.Body)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("%s: %s", response.Status, err.Error()))
		}
		if strings.Contains(string(bodyBytes), "ray") { // cf js challenge
			headers, postBytes, err := r.bypassCFJSChallenge(req.GetFullUrl())
			if err != nil {
				return nil, errors.New("未通过cloudflare验证：" + err.Error())
			}

			var newReq = service.NewRequest()
			newReq.Method = "POST"
			newReq.Path = req.Path
			newReq.QueryParams = req.QueryParams
			newReq.Header = headers
			newReq.Body = bytes.NewReader(postBytes)
			r.header = headers
			//r.setCFClearanceFromReqHeader(headers)
			return newReq.Fetch(r.http, "https://api.shodan.io", func(response *http.Response) error {
				if response.StatusCode == 401 {
					bodyBytes, err := io.ReadAll(response.Body)
					if err != nil {
						return err
					}
					errMsg := gjson.Get(string(bodyBytes), "error").String()
					if errMsg == "" {
						errMsg = "invalid API key"
					}
					return errors.New(errMsg)
				}
				if response.StatusCode == 400 {
					bodyBytes, err := io.ReadAll(response.Body)
					if err != nil {
						return err
					}
					errMsg := gjson.Get(string(bodyBytes), "error").String()
					if errMsg == "" {
						errMsg = response.Status
					}
					return errors.New(errMsg)
				}
				if response.StatusCode != 200 {
					return errors.New(response.Status)
				}
				r.setCFClearanceFromRespHeader(response.Header)
				r.userAgent = newReq.Header.Get("User-Agent")
				return nil
			})
		}
	}

	if response.StatusCode != 200 {
		return nil, errors.New(response.Status)
	}

	return io.ReadAll(response.Body)
}

func (r *Shodan) HostSearch(query, facets string, pageNum int, minify bool) (*shodan.HostSearchResult, error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/shodan/host/search"
	req.QueryParams.Set("query", query)
	req.QueryParams.Set("facets", facets)
	req.QueryParams.Set("page", strconv.Itoa(pageNum))
	if minify {
		req.QueryParams.Set("minify", "true")
	} else {
		req.QueryParams.Set("minify", "false")
	}
	bodyBytes, err := r.request(req)
	if err != nil {
		return nil, err
	}
	result := &shodan.HostSearchResult{}
	if err := json.Unmarshal(bodyBytes, result); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *Shodan) transform(detail *properties.General) {

}

type User struct {
	ScanCredits  int         `json:"scan_credits"`
	UsageLimits  UsageLimits `json:"usage_limits"`
	Plan         string      `json:"plan"`
	HTTPS        bool        `json:"https"`
	Unlocked     bool        `json:"unlocked"`
	QueryCredits int         `json:"query_credits"`
	MonitoredIps int         `json:"monitored_ips"`
	UnlockedLeft int         `json:"unlocked_left"`
	Telnet       bool        `json:"telnet"`
}
type UsageLimits struct {
	ScanCredits  int `json:"scan_credits"`
	QueryCredits int `json:"query_credits"`
	MonitoredIps int `json:"monitored_ips"`
}

func (r *Shodan) User() (*User, error) {
	req := service.NewRequest()
	req.Method = "GET"
	req.Path = "/api-info"
	bodyBytes, err := r.request(req)
	if err != nil {
		return nil, err
	}
	user := &User{}
	if err := json.Unmarshal(bodyBytes, user); err != nil {
		return nil, err
	}
	return user, nil
}
