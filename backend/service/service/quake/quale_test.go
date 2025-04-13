package quake

import (
	"encoding/json"
	"fine/backend/application"
	"fmt"
	"testing"

	"github.com/fasnow/goproxy"
)

func TestRealtimeService_Service(t *testing.T) {
	c := New(application.DefaultApp.Config.Quake.Token)
	p := goproxy.New()
	p.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(p)
	req := NewRealtimeServiceReqBuilder().
		Query("baidu.com").
		Page(1).
		Size(1)
	result, err := c.RealtimeServer.Service(req)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(result.Total)
}

func TestName(t *testing.T) {
	// 示例：键为小写字母的 map
	m := map[string]interface{}{
		"name":  "Alice",
		"age":   25,
		"email": "alice@example.com",
	}

	// 使用 json.Marshal 序列化
	data, err := json.Marshal(m)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Serialized JSON:", string(data))
	}
}
