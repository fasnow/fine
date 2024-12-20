package quake

import (
	"fine/backend/app"
	"fine/backend/config/v2"
	"fmt"
	"testing"
)

func TestBridge_GetUserInfo(t *testing.T) {
	a := &app.App{}
	a.UseProxyManager(config.ProxyManager)
	c := NewQuakeBridge(a)
	userInfo, err := c.GetUserInfo()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(userInfo)
}
