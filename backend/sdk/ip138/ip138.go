package ip138

import (
	"github.com/fasnow/ghttp"
)

// 从baseReadURL获取ip解析结果，如果有则直接返回结果
// 如果没有，则先从baseURL页面获取一个_TOKEN，利用该_TOKEN通过baseWriteURL先写入对应的域名，然后再访问baseReadURL即可

type Response struct {
	Status bool   `json:"status"`
	Code   int    `json:"code"`
	Msg    string `json:"msg"`
	Data   []struct {
		IP   string `json:"ip"`
		Sign string `json:"sign"`
	} `json:"data"`
}

type IP138 struct {
	http   *ghttp.Client
	domain string
	Domain *domain
	IP     *ip
}

func NewClient() *IP138 {
	client := &IP138{
		http:   &ghttp.Client{},
		Domain: &domain{},
		IP:     &ip{},
	}
	client.Domain.client = client
	client.IP.client = client
	return client
}
