package wechat

import (
	"encoding/json"
	"fine/backend/application"
	"testing"
)

func TestBridge_GetAllMiniProgram(t *testing.T) {
	app := application.DefaultApp
	c := NewWechatBridge(app)
	miniPrograms, err := c.GetAllMiniApp()
	if err != nil {
		t.Error(err)
		return
	}
	bytes, _ := json.Marshal(miniPrograms)
	t.Log(string(bytes))
}

func TestBridge_extractInfo(t *testing.T) {
	//app := application.DefaultApp
	//c := NewWechatBridge(app)
	//c.extractInfo("wxc76247c1ed91383e", "17")
}
