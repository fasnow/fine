package hunter

import (
	"net/http"
)

const (
	// HunterApiUrl 鹰图api
	HunterApiUrl = "https://hunter.qianxin.com/openApi/search"
)

type Hunter struct {
	key  string
	Http *http.Client
}

func NewClient(key string) *Hunter {
	return &Hunter{
		key:  key,
		Http: &http.Client{},
	}
}

func (h *Hunter) SetAuth(key string) {
	h.key = key
}
