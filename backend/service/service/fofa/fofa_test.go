package fofa

import (
	"encoding/json"
	"fine/backend/application"
	"fmt"
	"testing"

	"github.com/fasnow/goproxy"
)

func TestFofa_User(t *testing.T) {
	c := New(application.DefaultApp.Config.Fofa.Token)
	err := application.DefaultApp.ProxyManager.SetProxy("http://127.0.0.1:8081")
	if err != nil {
		fmt.Println(err)
		return
	}
	userInfo, err := c.User()
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(userInfo.Email)
}

func TestStatisticalAggs_Query(t *testing.T) {
	c := New(application.DefaultApp.Config.Fofa.Token)
	proxy := goproxy.New()
	proxy.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(proxy)
	req := NewStatAggsReqBuilder().Fields("country").Query("title=百度").Build()
	aggs, err := c.StatisticalAggs.Query(req)
	if err != nil {
		t.Error(err)
		return
	}
	bytes, err := json.Marshal(aggs)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(string(bytes))

}

func TestHostAggs_Host(t *testing.T) {
	c := New(application.DefaultApp.Config.Fofa.Token)
	proxy := goproxy.New()
	proxy.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(proxy)
	req := NewHostStatReqBuilder().Detail(true).Host("78.48.50.249").Build()
	aggs, err := c.HostAggs.Query(req)
	if err != nil {
		t.Error(err)
		return
	}
	bytes, err := json.Marshal(aggs)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(string(bytes))

}

func TestFofa_Query(t *testing.T) {
	c := New(application.DefaultApp.Config.Fofa.Token)
	proxy := goproxy.New()
	proxy.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(proxy)
	req := NewSearchAllReqBuilder().Page(1).Size(10).Query("domain=baidu.com").Fields("link").Build()
	result, err := c.Query(req)
	if err != nil {
		t.Error(err)
		return
	}
	bytes, err := json.Marshal(result)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(string(bytes))
}
