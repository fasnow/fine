package proxy

import (
	"context"
	"github.com/pkg/errors"
	"golang.org/x/net/proxy"
	"net"
	"net/http"
	"net/url"
	"time"
)

const defaultUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"

type Manager struct {
	client   *http.Client
	proxyUrl string
	timeout  time.Duration
}

// CustomTransport 自定义的 RoundTripper，用于添加全局的请求头
type CustomTransport struct {
	Header http.Header
	http.Transport
}

// RoundTrip 实现了 RoundTripper 接口的 RoundTrip 方法
func (c *CustomTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	// 设置默认 UA
	if _, ok := req.Header["User-Agent"]; !ok {
		req.Header.Set("User-Agent", defaultUA)
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

func NewManager() *Manager {
	return &Manager{
		client: &http.Client{
			Transport: &CustomTransport{
				Header: http.Header{"User-Agent": []string{defaultUA}},
			},
			Timeout: 20 * time.Second,
			// 禁止重定向
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

// SetProxy 支持 HTTP 和 SOCKS5 代理，空值则为默认
func (r *Manager) SetProxy(s string) error {
	var transport = r.client.Transport.(*CustomTransport)
	if s == "" {
		transport.Transport.Proxy = nil
		return nil
	}
	proxyURL, err := url.Parse(s)
	if err != nil {
		return err
	}
	switch proxyURL.Scheme {
	case "http", "https":
		transport.Transport = http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
		if proxyURL.User != nil {
			username := proxyURL.User.Username()
			password, _ := proxyURL.User.Password()
			transport.Transport.Proxy = func(req *http.Request) (*url.URL, error) {
				req.SetBasicAuth(username, password)
				return proxyURL, nil
			}
		}
	case "socks5":
		var auth *proxy.Auth
		if proxyURL.User != nil {
			auth = &proxy.Auth{
				User:     proxyURL.User.Username(),
				Password: "",
			}
			if password, ok := proxyURL.User.Password(); ok {
				auth.Password = password
			}
		}
		dialer, err := proxy.SOCKS5("tcp", proxyURL.Host, auth, proxy.Direct)
		if err != nil {
			return errors.New("Failed to create SOCKS5 dialer: " + err.Error())
		}

		transport.Transport = http.Transport{
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				return dialer.Dial(network, addr)
			},
		}
	default:
		return errors.New("Unsupported proxy scheme: " + proxyURL.Scheme)
	}
	r.client.Transport = transport
	r.proxyUrl = s
	return nil
}

func (r *Manager) SetTimeout(timeout time.Duration) {
	r.timeout = timeout
	r.client.Timeout = timeout
}

func (r *Manager) GetClient() *http.Client {
	return r.client
}

func (r *Manager) ProxyString() string {
	return r.proxyUrl
}
