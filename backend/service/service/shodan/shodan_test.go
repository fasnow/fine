package shodan

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fine/backend/application"
	"fine/backend/proxy/v2"
	"fmt"
	"github.com/chromedp/cdproto/fetch"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
	"github.com/go-vgo/robotgo"
	"net/http"
	"strings"
	"testing"
	"time"
)

func TestShodan_HostIP(t *testing.T) {
	c := New("")
	p := proxy.NewManager()
	p.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(p)
	c.SetAuth(application.DefaultApp.Config.Shodan.Token)
	result, err := c.HostSearch("ip:104.21.91.21", "asn", 1, false)
	if err != nil {
		t.Error(err)
	}
	bytes, _ := json.Marshal(result)
	t.Log(string(bytes))
}

func TestShodan_User(t *testing.T) {
	p := proxy.NewManager()
	p.SetProxy("http://127.0.0.1:8081")
	c := New(application.DefaultApp.Config.Shodan.Token)
	c.UseProxyManager(p)
	user, err := c.User()
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(user.QueryCredits)
}

func getPostDataAfterCF(url string) (http.Header, []byte, error) {
	screenWidth, screenHeight := robotgo.GetScreenSize() // 获取屏幕分辨率
	winWidth, winHeight := 800, 600                      // 设定窗口大小

	x := (screenWidth - winWidth) / 2
	y := (screenHeight - winHeight) / 2
	// 创建 ChromeDP 执行分配器选项
	opts := []chromedp.ExecAllocatorOption{
		chromedp.ProxyServer(application.DefaultApp.ProxyManager.ProxyString()),
		chromedp.Flag("headless", false),                                        // 禁用 Headless 模式
		chromedp.Flag("disable-blink-features", "AutomationControlled"),         // 隐藏自动化标志
		chromedp.Flag("disable-features", "Translate"),                          // 关闭翻译功能
		chromedp.Flag("window-size", fmt.Sprintf("%d,%d", winWidth, winHeight)), // 窗口大小
		chromedp.Flag("window-position", fmt.Sprintf("%d,%d", x, y)),            // 窗口位置
		chromedp.Flag("ignore-certificate-errors", true),                        // 忽略证书错误
		//chromedp.Flag("app", url),                                               // 打开url并禁用地址栏
		chromedp.NoFirstRun, // 跳过首次使用是弹出的确认提示
		chromedp.Flag("disable-features", "site-per-process"), // 禁用站点隔离否则无法在请求头或者响应头中直接获取cookie
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
			// 检查请求方法是否为 POST
			if ev.Request.Method == "POST" && strings.Contains(ev.Request.URL, "/shodan/host/search") {
				// 存储请求头
				for k, v := range ev.Request.Headers {
					postHeaders.Add(k, v.(string))
				}

				// 存储cookie
				err3 := chromedp.Run(chromeCtx, chromedp.ActionFunc(func(ctx context.Context) error {
					cookies, err2 := network.GetCookies().Do(ctx)
					if err2 != nil {
						return err2
					}
					var t []string
					for _, cookie := range cookies {
						t = append(t, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
					}
					postHeaders.Add("Set-Cookie", strings.Join(t, ";"))
					return nil
				}))
				if err3 != nil {
					fmt.Println(err3)
					return
				}

				// 存储请求体
				var t string
				for _, entry := range ev.Request.PostDataEntries {
					t += entry.Bytes
				}
				bytes, err2 := base64.StdEncoding.DecodeString(t)
				if err2 != nil {
					return
				}
				postBody = bytes

				// 取消上下文，退出程序
				success = true
				cancelChrome()
			}
		}
	})

	err = chromedp.Run(chromeCtx,
		// 启用网络监听
		network.Enable(),
		chromedp.Navigate(url),
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

func TestCFBypass(t *testing.T) {
	c := New(application.DefaultApp.Config.Shodan.Token)
	c.UseProxyManager(application.DefaultApp.ProxyManager)
	_, err := c.HostSearch("port:23", "", 1, false)
	if err != nil {
		t.Error(err)
		return
	}
	//c.bypassCFJSChallenge("https://baidu.com")

	//request, cf, err := utils.BypassCFJSChallenge(application.DefaultApp.ProxyManager, fmt.Sprintf("https://api.shodan.io/shodan/host/search?key=%s&query=port:23&facets=org,os", application.DefaultApp.Config.Shodan.Token))
	//if err != nil {
	//	t.Error(err)
	//	return
	//}
	//t.Log(request)
	//t.Log(cf)
}

func TestName(t *testing.T) {
	screenWidth, screenHeight := robotgo.GetScreenSize() // 获取屏幕分辨率
	winWidth, winHeight := 800, 600                      // 设定窗口大小

	x := (screenWidth - winWidth) / 2
	y := (screenHeight - winHeight) / 2

	// 创建 ChromeDP 执行分配器选项
	opts := []chromedp.ExecAllocatorOption{
		chromedp.ProxyServer("http://127.0.0.1:8081"),
		chromedp.Flag("headless", false),                                        // 禁用 Headless 模式
		chromedp.Flag("disable-blink-features", "AutomationControlled"),         // 隐藏自动化标志
		chromedp.Flag("disable-features", "Translate"),                          // 关闭翻译功能
		chromedp.Flag("window-size", fmt.Sprintf("%d,%d", winWidth, winHeight)), // 窗口大小
		chromedp.Flag("window-position", fmt.Sprintf("%d,%d", x, y)),            // 窗口位置
		chromedp.Flag("ignore-certificate-errors", true),                        // 忽略证书错误
		chromedp.Flag("app", "https://baidu.com"),                               // 打开url并禁用地址栏
		chromedp.NoFirstRun, // 跳过首次使用是弹出的确认提示
	}

	// 创建 ChromeDP 执行分配器
	allocCtx, cancelAlloc := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancelAlloc()

	// 创建 ChromeDP 上下文
	ctx, cancelChrome := chromedp.NewContext(allocCtx)
	defer cancelChrome()

	chromedp.ListenTarget(ctx, func(ev interface{}) {
		go func() {
			switch ev := ev.(type) {
			// 拦截请求
			case *fetch.EventRequestPaused:
				if ev.ResponseStatusCode == 0 { // 请求阶段
					fmt.Println(1, ev.ResponseStatusCode)
					err := chromedp.Run(ctx, chromedp.ActionFunc(func(ctx context.Context) error {
						params := fetch.ContinueRequest(ev.RequestID)
						//params.InterceptResponse = true
						return params.Do(ctx)
					}))
					if err != nil {
						fmt.Println(err)
					}
				} else { // 响应阶段
					err := chromedp.Run(ctx, chromedp.ActionFunc(func(ctx context.Context) error {
						params := fetch.ContinueResponse(ev.RequestID)
						return params.Do(ctx)
					}))
					if err != nil {
						fmt.Println(err)
					}
				}
				break
			}
		}()
	})
	if err := chromedp.Run(ctx,
		fetch.Enable().WithPatterns([]*fetch.RequestPattern{
			{
				URLPattern:   "*",                       // 拦截所有请求
				RequestStage: fetch.RequestStageRequest, // 在请求阶段拦截
			},
			{
				URLPattern:   "*",                        // 拦截所有请求
				RequestStage: fetch.RequestStageResponse, // 在响应阶段拦截
			},
		}),
		chromedp.Sleep(20*time.Second),
	); err != nil {
		t.Error(err)
	}
}

func bypassCFJSChallenge(url string) (http.Header, []byte, error) {
	screenWidth, screenHeight := robotgo.GetScreenSize() // 获取屏幕分辨率
	winWidth, winHeight := 800, 600                      // 设定窗口大小

	x := (screenWidth - winWidth) / 2
	y := (screenHeight - winHeight) / 2

	// 创建 ChromeDP 执行分配器选项
	opts := []chromedp.ExecAllocatorOption{
		chromedp.ProxyServer("http://127.0.0.1:8081"),
		chromedp.Flag("headless", false),                                        // 禁用 Headless 模式
		chromedp.Flag("disable-blink-features", "AutomationControlled"),         // 隐藏自动化标志
		chromedp.Flag("disable-features", "Translate"),                          // 关闭翻译功能
		chromedp.Flag("window-size", fmt.Sprintf("%d,%d", winWidth, winHeight)), // 窗口大小
		chromedp.Flag("window-position", fmt.Sprintf("%d,%d", x, y)),            // 窗口位置
		chromedp.Flag("ignore-certificate-errors", true),                        // 忽略证书错误
		chromedp.Flag("app", url),                                               // 打开url并禁用地址栏
		chromedp.NoFirstRun,                                                     // 跳过首次使用是弹出的确认提示
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

func Test1(t *testing.T) {
	header, bodyBytes, err := bypassCFJSChallenge("https://api.shodan.io/shodan/host/search?facets=&key=vm5KkoxkBZlGoNlNnm00M0ZBuIx96syR1&minify=false&page=1&query=port%3A23")
	if err != nil {
		t.Error(err)
		return
	}
	fmt.Println(header)
	fmt.Println(string(bodyBytes))

	//header, bodyBytes, err := getPostDataAfterCF("https://api.shodan.io/shodan/host/search?facets=&key=vm5KkoxkBZlGoNlNnm00M0ZBuIx96syR1&minify=false&page=1&query=port%3A23")
	//if err != nil {
	//	t.Error(err)
	//	return
	//}
	//t.Log(header)
	//t.Log(string(bodyBytes))
}
