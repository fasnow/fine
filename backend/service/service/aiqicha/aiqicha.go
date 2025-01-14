package aiqicha

import (
	"fine/backend/proxy/v2"
	"net/http"
)

type AiQiCha struct {
	http         *http.Client
	proxyManager *proxy.Manager
	cookie       string
}

func NewClient(token string) *AiQiCha {
	return &AiQiCha{
		http:   &http.Client{},
		cookie: token,
	}
}

func (r *AiQiCha) UseProxyManager(manager *proxy.Manager) {
	r.proxyManager = manager
	r.http = manager.GetClient()
}

func (r *AiQiCha) SetToken(value string) {
	r.cookie = value
}
