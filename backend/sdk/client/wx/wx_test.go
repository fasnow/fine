package wechat

import (
	"encoding/json"
	"fmt"
	"testing"
)

func Test_getFileStructure(t *testing.T) {
	fileStructure, err := getFileStructure("D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wxb1cbdb526d151605.zip")
	if err != nil {
		return
	}
	marshal, err := json.Marshal(fileStructure)
	if err != nil {
		return
	}
	t.Log(string(marshal))
	content, err := getFileContent("D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wxb1cbdb526d151605.zip",
		"wxb1cbdb526d151605\\app-config.json")
	if err != nil {
		return
	}
	t.Log(string(content))
}

func TestWxMiniProgram_GetAppletSubDir(t *testing.T) {
	r := &WxMiniProgram{}
	subDir, err := r.GetAppletSubDir()
	if err != nil {
		return
	}
	marshal, err := json.Marshal(subDir)
	if err != nil {
		return
	}
	fmt.Println(string(marshal))
}
