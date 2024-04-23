package proxy

import (
	"fine/backend/logger"
	"net/http"
	"net/url"
	"reflect"
	"sync"
	"time"
)

type Manager struct {
	proxyClient *http.Client
	proxyUrl    string
}

var (
	instance         *Manager
	once             sync.Once
	defaultTransport = &CustomTransport{
		//默认请求头
		Header: http.Header{"User-Agent": []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"}},
	}
)

// CustomTransport 自定义的 RoundTripper，用于添加全局的请求头
type CustomTransport struct {
	Header http.Header
	http.Transport
}

// RoundTrip 实现了 RoundTripper 接口的 RoundTrip 方法
func (c *CustomTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	//设置默认UA
	if _, ok := req.Header["User-Agent"]; !ok {
		req.Header.Set("User-Agent", defaultTransport.Header.Get("User-Agent"))
	}

	// 添加其他请求头
	for key, values := range c.Header {
		if key == "User-Agent" {
			continue
		}
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	return c.Transport.RoundTrip(req)
}

func GetSingleton() *Manager {
	// 通过 sync.Once 确保仅执行一次实例化操作
	once.Do(func() {
		instance = &Manager{
			proxyClient: &http.Client{
				Transport: defaultTransport,
			},
		}
	})
	return instance
}

// Add 添加一个需要使用代理的类，该类必须具有一个导出的http.client或者*http.client属性
func (r *Manager) Add(client ...any) {
	for _, c := range client {
		// 获取值的类型
		t := reflect.TypeOf(c)

		if t.Kind() == reflect.Ptr {
			// 获取指针指向的类型
			t = t.Elem()
		}
		if t.Kind() != reflect.Struct {
			return
		}

		// 遍历结构体的字段
		for i := 0; i < t.NumField(); i++ {
			field := t.Field(i)
			// 判断字段类型是否为 *http.Client
			if field.Type == reflect.TypeOf(&http.Client{}) {
				reflect.ValueOf(c).Elem().Field(i).Set(reflect.ValueOf(r.proxyClient))
				break
			}
		}
	}
}

// SetTimeout 小于等于0则为默认
func (r *Manager) SetTimeout(timeout time.Duration) {
	r.proxyClient.Timeout = timeout
}

func (r *Manager) GetTimeout() time.Duration {
	return r.proxyClient.Timeout
}

// SetProxy 空值则为默认
func (r *Manager) SetProxy(proxy string) error {
	r.proxyUrl = proxy
	var transport = &CustomTransport{}
	if proxy == "" {
		transport.Header = defaultTransport.Header
		transport.Transport = http.Transport{
			Proxy: nil,
		}
		r.proxyClient.Transport = transport
		return nil
	}
	proxyURL, err := url.Parse(proxy)
	if err != nil {
		logger.Info(err.Error())
		return err
	}
	transport.Header = defaultTransport.Header
	transport.Transport = http.Transport{
		Proxy: http.ProxyURL(proxyURL),
	}
	r.proxyClient.Transport = transport
	return nil
}
func (r *Manager) ProxyString() string {
	return r.proxyUrl
}
