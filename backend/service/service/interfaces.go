package service

import (
	"fine/backend/proxy/v2"
	"net/url"
)

type Client interface {
	SetAuth(auth string)
	GenAuthQueryParam() url.Values
	UseProxyManager(manager *proxy.Manager)
}
