package wxMiniprogram

import (
	"testing"
)

func TestGetApkgInfo(t *testing.T) {
	var filename = "D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189.wxapkg"
	DoFile(filename)
}

func TestDoConfig(t *testing.T) {

	var err = DoConfig("D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189\\app-config.json")
	if err != nil {
		t.Log(err)
		return
	}
	//marshal, err := json.Marshal(a["pages"])
	//if err != nil {
	//	t.Log(err)
	//	return
	//}
	//t.Log(string(marshal))
}
