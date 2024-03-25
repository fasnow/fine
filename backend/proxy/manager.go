package proxy

import (
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
	instance *Manager
	once     sync.Once
)

func GetSingleton() *Manager {
	// 通过 sync.Once 确保仅执行一次实例化操作
	once.Do(func() {
		instance = &Manager{
			proxyClient: &http.Client{},
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
	// 使用指针的强制转换来设置代理
	transport := r.proxyClient.Transport

	if proxy == "" {
		if transport != nil {
			transport.(*http.Transport).Proxy = nil
			r.proxyClient.Transport = transport
		}
		return nil
	}

	// 解析代理地址
	proxyURL, err := url.Parse(proxy)
	if err != nil {
		return err
	}

	if transport == nil {
		transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	} else {
		transport.(*http.Transport).Proxy = http.ProxyURL(proxyURL)
	}
	r.proxyClient.Transport = transport

	return nil
}
func (r *Manager) ProxyString() string {
	return r.proxyUrl
}
