package utils

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
	"github.com/fasnow/goproxy"
	"github.com/go-vgo/robotgo"
	"net/http"
	"time"
)

// BypassCFJSChallenge 返回cf_clearance和对于的最后一次请求
func BypassCFJSChallenge(proxyManager *goproxy.GoProxy, targetUrl string) (*http.Request, string, error) {
	proxyUrl := ""
	if proxyManager != nil {
		proxyUrl = proxyManager.String()
	}
	screenWidth, screenHeight := robotgo.GetScreenSize() // 获取屏幕分辨率
	winWidth, winHeight := 800, 600                      // 设定窗口大小

	x := (screenWidth - winWidth) / 2
	y := (screenHeight - winHeight) / 2

	// 创建 ChromeDP 执行分配器选项
	opts := []chromedp.ExecAllocatorOption{
		chromedp.ProxyServer(proxyUrl),
		chromedp.Flag("headless", false),                                        // 禁用 Headless 模式
		chromedp.Flag("disable-blink-features", "AutomationControlled"),         // 隐藏自动化标志
		chromedp.Flag("disable-features", "Translate"),                          // 关闭翻译功能
		chromedp.Flag("window-size", fmt.Sprintf("%d,%d", winWidth, winHeight)), // 窗口大小
		chromedp.Flag("window-position", fmt.Sprintf("%d,%d", x, y)),            // 窗口位置
		chromedp.Flag("ignore-certificate-errors", true),                        // 忽略证书错误
		chromedp.Flag("app", targetUrl),                                         // 打开url并禁用地址栏
		chromedp.NoFirstRun,                                                     // 跳过首次使用是弹出的确认提示
	}

	// 创建 ChromeDP 执行分配器
	allocCtx, cancelAlloc := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancelAlloc()

	// 创建 ChromeDP 上下文
	chromeCtx, cancelChrome := chromedp.NewContext(allocCtx)
	defer cancelChrome()

	var success bool
	var cfClearance string
	var resultRequest *http.Request
	var err error
	var lastReq *network.Request

	// 监听Tab事件
	chromedp.ListenBrowser(chromeCtx, func(ev interface{}) {
		// 未考虑 crash事件
		if ev, ok := ev.(*target.EventTargetDestroyed); ok {
			if c := chromedp.FromContext(chromeCtx); c != nil {
				if c.Target.TargetID == ev.TargetID {
					cancelChrome()
				}
			}
		}
	})

	chromedp.ListenTarget(chromeCtx, func(ev interface{}) {
		go func() {
			switch ev := ev.(type) {
			case *network.EventResponseReceived:
				err = chromedp.Run(chromeCtx, chromedp.ActionFunc(func(ctx context.Context) error {
					cookies, err2 := network.GetCookies().Do(ctx)
					if err2 != nil {
						return err2
					}
					for _, cookie := range cookies {
						if cookie.Name == "cf_clearance" {
							cfClearance = cookie.Value
							headers := make(http.Header)
							for k, v := range lastReq.Headers {
								headers.Add(k, v.(string))
							}
							var t string
							for _, entry := range lastReq.PostDataEntries {
								t += entry.Bytes
							}
							bodyBytes, err3 := base64.StdEncoding.DecodeString(t)
							if err3 != nil {
								return err3
							}
							if lastReq.Method == "POST" {
								resultRequest, err3 = http.NewRequest(lastReq.Method, lastReq.URL, bytes.NewReader(bodyBytes))
							} else if lastReq.Method == "GET" {
								resultRequest, err3 = http.NewRequest(lastReq.Method, lastReq.URL, nil)
							}
							resultRequest.Header = headers
							success = true
							//cancelChrome()
							break
						}
					}
					return nil
				}))
				break
			case *network.EventRequestWillBeSent:
				lastReq = ev.Request
			}
		}()
	})

	err = chromedp.Run(chromeCtx,
		chromedp.ActionFunc(func(ctx context.Context) error {
			for {
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(1 * time.Second):
					//if len(cfClearance) > 0 {
					//	return nil
					//}
				}
			}
		}),
	)
	if err != nil && !success {
		return nil, "", err
	}
	return resultRequest, cfClearance, nil
}
