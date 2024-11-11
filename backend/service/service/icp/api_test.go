package icp

import (
	"fine/backend/proxy"
	"testing"
)

func TestICP_GetImage(t *testing.T) {
	client := NewClient()
	proxyManger := proxy.NewManager()
	proxyManger.Add(client)
	proxyManger.SetProxy("http://127.0.0.1:8081")
	//err := client.setTokenFromRemote()
	//if err != nil {
	//	t.Error(err)
	//	return
	//}
	//t.Log(client.token, client.refreshToken, client.expireIn)
	err := client.setTokenFromRemote()
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(client.token, client.refreshToken, client.expireIn)
	result, err := client.PageNum(1).PageSize(1).ServiceType("1").Query("baidu.com")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(result)

}
