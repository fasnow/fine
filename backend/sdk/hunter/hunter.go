package hunter

import (
	"github.com/fasnow/ghttp"
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

func (h *Hunter) SetHttpClient(client *ghttp.Client) {
	h.http = client
}
