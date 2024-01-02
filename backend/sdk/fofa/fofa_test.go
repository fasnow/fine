package fofa

import (
	"github.com/fasnow/ghttp"
	"github.com/goccy/go-json"
	"strings"
	"testing"
)

func TestFofa_Get(t *testing.T) {
	_ = ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient("email-email@foxmail.com", "63843efcebff1756f3a539e85cf35c0b")
	builder := NewGetDataReqBuilder().Query("domain=baidu.com").Page(1).Size(10).Build()
	result, err := client.Get(builder)
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range result.Items {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
	t.Log(strings.Repeat("-", 50))
	builder2 := NewGetDataReqBuilder().
		Query("domain=baidu.com").
		Page(1).Size(10).
		Fields("link,ip,port,title").
		Build()
	items2, err := client.Get(builder2)
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range items2.Items {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestExport(t *testing.T) {
	var items = []*Item{
		{
			Ip:              "",
			Port:            "",
			Protocol:        "",
			Country:         "",
			CountryName:     "",
			Region:          "",
			City:            "",
			Longitude:       "",
			Latitude:        "",
			AsNumber:        "",
			AsOrganization:  "",
			Host:            "",
			Domain:          "",
			Os:              "",
			Server:          "",
			Icp:             "",
			Title:           "",
			Jarm:            "",
			Header:          "",
			Banner:          "",
			Cert:            "",
			BaseProtocol:    "",
			Link:            "",
			Product:         "",
			ProductCategory: "",
			Version:         "",
			LastUpdateTime:  "",
			Cname:           "",
			IconHash:        "",
			CertsValid:      "",
			CnameDomain:     "",
			Body:            "",
			Icon:            "",
			Fid:             "",
			Structinfo:      "",
		},
	}
	err := Export(items, "D:\\Tools\\code\\fine\\server\\out\\1.xlsx", "host", "port")
	if err != nil {
		t.Log(err)
		return
	}
}
