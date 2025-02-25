package aiqicha

import (
	"encoding/json"
	"fine/backend/application"
	"fine/backend/proxy/v2"
	"fmt"
	"testing"
)

func TestTianYanCha_Suggest(t *testing.T) {
	c := NewClient("1")
	m := proxy.NewManager()
	_ = m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	list, err := c.Suggest("中国移动")
	if err != nil {
		t.Error(err)
		return
	}
	marshal, e := json.Marshal(list)
	if e != nil {
		return
	}
	t.Log(string(marshal))
}

func TestAiqicha_GetStockChart(t *testing.T) {
	c := NewClient(application.DefaultApp.Config.AiQiCha.Cookie)
	m := proxy.NewManager()
	_ = m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	list, err := c.GetStockChart("28683666725524", "0")
	if err != nil {
		t.Error(err)
		return
	}
	marshal, e := json.Marshal(list)
	if e != nil {
		return
	}
	t.Log(string(marshal))
}

func TestAiQiCha_GetCopyrightList(t *testing.T) {
	c := NewClient(application.DefaultApp.Config.AiQiCha.Cookie)
	m := proxy.NewManager()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	total, list, err := c.GetCopyrightList("28783255028393", 1, 10)
	if err != nil {
		t.Error(err)
		return
	}
	fmt.Println(total)
	for _, i := range list {
		fmt.Println(i)
	}
}

func TestAiQiCha_GetBranchList(t *testing.T) {
	c := NewClient(application.DefaultApp.Config.AiQiCha.Cookie)
	m := proxy.NewManager()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	total, list, err := c.GetBranchList("28783255028393", 1, 1)
	if err != nil {
		t.Error(err)
		return
	}
	fmt.Println(total)
	for _, i := range list {
		fmt.Println(i)
	}
}
