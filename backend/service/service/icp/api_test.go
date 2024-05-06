package icp

import (
	"fine/backend/proxy"
	"testing"
)

func TestICP_GetImage(t *testing.T) {
	client := NewClient()
	proxy.GetSingleton().Add(client)
	proxy.GetSingleton().SetProxy("http://127.0.0.1:8080")
	err := client.SetTokenFromRemote()
	if err != nil {
		t.Error(err)
		return
	}
	image, err := client.GetImage()
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(image)
}
