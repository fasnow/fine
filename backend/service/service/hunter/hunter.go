package hunter

import (
	"fine/backend/proxy/v2"
	"net/http"
)

const (
	// HunterApiUrl 鹰图api
	HunterApiUrl = "https://hunter.qianxin.com/openApi/search"
)

type Hunter struct {
	key  string
	http *http.Client
}

func NewClient(key string) *Hunter {
	return &Hunter{
		key:  key,
		http: &http.Client{},
	}
}

func (r *Hunter) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func (r *Hunter) SetAuth(key string) {
	r.key = key
}
