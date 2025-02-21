package aiqicha

import (
	"encoding/json"
	"fine/backend/proxy/v2"
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
	c := NewClient("1")
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
