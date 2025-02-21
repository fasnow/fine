package fofa

import (
	"encoding/json"
	"fine/backend/application"
	"fine/backend/proxy/v2"
	"fmt"
	"testing"
)

func TestFofa_Get(t *testing.T) {
	b := NewFofaBridge(application.DefaultApp)
	err := application.DefaultApp.ProxyManager.SetProxy("http://127.0.0.1:8080")
	if err != nil {
		fmt.Println(err)
		return
	}
	userInfo, err := b.GetUserInfo()
	if err != nil {
		fmt.Println(err)
		//return
	}
	fmt.Println(userInfo)

	err = application.DefaultApp.ProxyManager.SetProxy("")
	if err != nil {
		fmt.Println(err)
		return
	}
	userInfo2, err := b.GetUserInfo()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(userInfo2)
}

func TestStatisticalAggs_Query(t *testing.T) {
	c := NewClient("")
	proxy := proxy.NewManager()
	proxy.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(proxy)
	aggs, err := c.StatisticalAggs.Fields("country").Query("title=百度")
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
	c := NewClient("")
	proxy := proxy.NewManager()
	proxy.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(proxy)
	aggs, err := c.HostAggs.Detail(true).Host("78.48.50.249")
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
