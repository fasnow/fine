package hunter

import (
	"github.com/fasnow/ghttp"
)

const (
	// HunterApiUrl 鹰图api
	HunterApiUrl = "https://hunter.qianxin.com/openApi/search"
)

type Hunter struct {
	key  string
	http *ghttp.Client
}

func NewClient(key string) *Hunter {
	return &Hunter{
		key:  key,
		http: &ghttp.Client{},
	}
}

func (h *Hunter) SetAuth(key string) {
	h.key = key
}
