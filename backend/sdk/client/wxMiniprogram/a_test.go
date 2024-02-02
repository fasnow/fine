package wxMiniprogram

import (
	"fmt"
	"os"
	"testing"
)

func TestGetApkgInfo(t *testing.T) {
	var filename = "D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189.wxapkg"
	buf, err := os.ReadFile(filename)
	if err != nil {
		t.Error(err)
	}
	apkgInfo, err := GetApkgInfo(buf)
	if err != nil {
		t.Error(err)
	}
	fmt.Println(len(apkgInfo.fileInfo))
	SplitFile(buf, apkgInfo.fileInfo, "D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189")

}

func TestDoConfig(t *testing.T) {
	var a, b, c = DoConfig("D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189\\app-config.json")
	t.Log(a)
	t.Log(b)
	t.Log(c)
}
