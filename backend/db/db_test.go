package db

import (
	fofa2 "fine-server/sdk/fofa"
	hunter2 "fine-server/sdk/hunter"
	quake2 "fine-server/sdk/quake"
	zone2 "fine-server/sdk/zone"
	"github.com/fasnow/ghttp"
	"github.com/goccy/go-json"
	_ "github.com/mattn/go-sqlite3"
	"testing"
)

func TestDatabase_Fofa(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := fofa2.NewClient("email-email@foxmail.com", "63843efcebff1756f3a539e85cf35c0b")
	builder := fofa2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Fields("host,ip,port,title").Build()
	result, err2 := client.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.FofaExportDataInsert("1", result.Items)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.FofaExportDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_Hunter(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := hunter2.NewClient("dc255a6d06e1546dadbae95f62b237c1ac6a5532a94351846850ea85ba031a0e")
	builder := hunter2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.HunterExportDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.HunterExportDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_Quake(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := quake2.NewClient("76b63b88-83c5-49ed-bcf5-9c340a75ac39")
	builder := quake2.NewGetRealtimeDataBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Realtime.Service(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.QuakeExportDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.QuakeExportDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneSite(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Site.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportSiteDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportSiteDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneApk(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Apk.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportApkDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportApkDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneDomain(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("baidu.com").Page(1).Size(10).Build()
	result, err2 := client.Domain.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportDomainDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportDomainDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneMember(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Member.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportMemberDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportMemberDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneCode(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Code.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportCodeDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportCodeDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneDarknet(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Darknet.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportDarknetDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportDarknetDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneAim(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("baidu.com").Page(1).Size(10).Build()
	result, err2 := client.AIM.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportAimDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	data, err := db.ZoneExportAimDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}

func TestDatabase_ZoneEmail(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := zone2.NewClient("22efec56808488e19811b9e4affc5432")
	builder := zone2.NewGetDataReqBuilder().Query("1").Page(1).Size(10).Build()
	result, err2 := client.Email.Get(builder)
	if err2 != nil {
		t.Log(err2)
		return
	}
	db, err := Get()
	if err != nil {
		t.Log(err)
		return
	}
	err = db.ZoneExportEmailDataInsert("1", result.Data)
	if err != nil {
		t.Log(err)
		return
	}
	t.Log(111)
	data, err := db.ZoneExportEmailDataGet("1")
	if err != nil {
		t.Log(err)
		return
	}
	for _, item := range data {
		marshal, _ := json.Marshal(item)
		t.Log(string(marshal))
	}
}
