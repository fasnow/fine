package tianyancha

import (
	"github.com/fasnow/goproxy"
	"net/http"
)

type TianYanCha struct {
	http         *http.Client
	proxyManager *goproxy.GoProxy
	token        string
}

func NewClient(token string) *TianYanCha {
	return &TianYanCha{
		http:  &http.Client{},
		token: token,
	}
}

func (r *TianYanCha) UseProxyManager(manager *goproxy.GoProxy) {
	r.proxyManager = manager
	r.http = manager.GetClient()
}

func (r *TianYanCha) SetAuth(value string) {
	r.token = value
}
