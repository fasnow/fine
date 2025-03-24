package tianyancha

import (
	"fine/backend/proxy/v2"
	"net/http"
)

type TianYanCha struct {
	http         *http.Client
	proxyManager *proxy.Manager
	token        string
}

func NewClient(token string) *TianYanCha {
	return &TianYanCha{
		http:  &http.Client{},
		token: token,
	}
}

func (r *TianYanCha) UseProxyManager(manager *proxy.Manager) {
	r.proxyManager = manager
	r.http = manager.GetClient()
}

func (r *TianYanCha) SetAuth(value string) {
	r.token = value
}
