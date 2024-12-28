package fofa

import (
	"fine/backend/app"
	"fine/backend/config"
	"fmt"
	"testing"
)

func TestFofa_Get(t *testing.T) {
	b := NewFofaBridge(app.NewApp())
	err := config.ProxyManager.SetProxy("http://127.0.0.1:8080")
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

	err = config.ProxyManager.SetProxy("")
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
