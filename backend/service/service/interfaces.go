package service

import (
	"github.com/fasnow/goproxy"
	"net/url"
)

type Client interface {
	SetAuth(auth string)
	GenAuthQueryParam() url.Values
	UseProxyManager(manager *goproxy.GoProxy)
}
