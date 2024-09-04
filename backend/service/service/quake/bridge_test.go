package quake

import (
	"fine/backend/app"
	"fmt"
	"net/http"
	"testing"
)

func TestBridge_GetUserInfo(t *testing.T) {
	c := NewQuakeBridge(&app.App{HttpClient: &http.Client{}})
	userInfo, err := c.GetUserInfo()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(userInfo)
}
