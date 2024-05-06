package domain2ip

import (
	"encoding/json"
	"github.com/miekg/dns"
	"github.com/pkg/errors"
	"io"
	"net/http"
	"strings"
	"time"
)

type IP2Domain struct {
	Htt *http.Client
}

func NewClient() *IP2Domain {
	return &IP2Domain{
		Htt: &http.Client{},
	}
}

func (r *IP2Domain) GetARecord(domain, address string) ([]string, error) {
	if !strings.HasSuffix(domain, ".") {
		domain += "."
	}
	client := dns.Client{
		Timeout: 2 * time.Second,
	}
	msg := dns.Msg{}
	msg.SetQuestion(domain, dns.TypeA)
	var items []string
	res, _, err := client.Exchange(&msg, address)
	if err != nil {
		return nil, err
	}
	for _, record := range res.Answer {
		if r, ok := record.(*dns.A); ok {
			items = append(items, r.A.String())
		}
	}
	return items, nil
}

type IPDetail struct {
	Addr     string `json:"addr"`
	Country  string `json:"country"`
	Area     string `json:"area"`
	Provider string `json:"provider"`
}

func (r *IP2Domain) GetIPDetail(ip string) (*IPDetail, error) {
	request, err := http.NewRequest("GET", "https://ip-moe.zerodream.net/?ip="+ip, nil)
	if err != nil {
		return nil, err
	}
	client := http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New("server error")
	}
	bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	var result struct {
		Status  int    `json:"status"`
		Message string `json:"message"`
		IPDetail
	}
	err = json.Unmarshal(bytes, &result)
	if err != nil {
		return nil, err
	}
	if result.Status != 200 {
		return nil, errors.New(result.Message)
	}
	return &result.IPDetail, nil
}

func (r *IP2Domain) GetCNAMERecord(domain, address string) ([]string, error) {
	if !strings.HasSuffix(domain, ".") {
		domain += "."
	}
	client := dns.Client{
		Timeout: 5 * time.Second,
	}
	msg := dns.Msg{}
	msg.SetQuestion(domain, dns.TypeCNAME)
	res, _, err := client.Exchange(&msg, address) // 使用 Google DNS 服务器进行查询
	if err != nil {
		return nil, err
	}
	if len(res.Answer) < 1 {
		return nil, nil
	}
	var items []string
	for _, record := range res.Answer {
		if r, ok := record.(*dns.CNAME); ok {
			items = append(items, strings.TrimRight(r.Target, "."))
		}
	}
	return items, nil
}

func (r *IP2Domain) IsCDN(domain, cname string) bool {
	return !strings.HasSuffix(cname, domain)
}
