package proxy

import (
	"fmt"
	"io"
	"net/http"
	"testing"
)

type CustomHttp struct {
	HttpClient *http.Client
}

func TestManager_SetProxy(t *testing.T) {
	c := &CustomHttp{HttpClient: &http.Client{}}
	GetSingleton().Add(c)

	GetSingleton().SetProxy("http://127.0.0.1:8080")
	response2, err2 := c.HttpClient.Get("http://bing.com")
	if err2 != nil {
		return
	}
	all2, err2 := io.ReadAll(response2.Body)
	if err2 != nil {
		return
	}
	fmt.Println(string(all2))

	GetSingleton().SetProxy("")
	response, err := c.HttpClient.Get("http://baidu.com")
	if err != nil {
		return
	}
	all, err := io.ReadAll(response.Body)
	if err != nil {
		return
	}
	fmt.Println(string(all))
}
