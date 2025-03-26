package wechat

import (
	"encoding/json"
	"fine/backend/application"
	"fine/backend/proxy/v2"
	"fine/backend/utils"
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

func TestWeChat_GetAllMiniProgram(t *testing.T) {
	c := WeChat{
		Applet: application.DefaultApp.Config.Wechat.Applet,
	}
	miniPrograms, err := c.GetAllMiniApp()
	if err != nil {
		t.Error(err)
		return
	}
	for _, miniProgram := range miniPrograms {
		for _, version := range miniProgram.Versions {
			t.Log(version)
		}
	}
}

func TestWeChat_getFilesInfo(t *testing.T) {
	c := New(application.DefaultApp.Config.Wechat.Applet)
	bytes, err := os.ReadFile("1.wxapkg")
	if err != nil {
		t.Error(err)
		return
	}
	filesInfo, err := c.getFilesInfo(bytes)
	if err != nil {
		t.Error(err)
		return
	}
	for _, fileInfo := range filesInfo {
		t.Log(fileInfo)
	}
}

func TestWeChat_UnpackWxapkg(t *testing.T) {
	c := New(application.DefaultApp.Config.Wechat.Applet)
	wxapkgs, err := c.GetMiniAppWxapkgs("wx109e915f7728f463", "48")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(wxapkgs)
	for _, wxapkg := range wxapkgs {
		bytes, _ := os.ReadFile(wxapkg)
		baseFilename := filepath.Base(wxapkg)
		dir := filepath.Join(application.DefaultApp.Config.WechatDataDir, "wx109e915f7728f463", "48", baseFilename[0:len(baseFilename)-7])
		if filesName, err := c.UnpackWxapkg(bytes, dir, func(err error) {
			fmt.Println(err)
		}); err != nil {
			t.Error(err)
		} else {
			t.Log(filesName)
		}
	}
}

func TestWeChat_DecryptWxapkg(t *testing.T) {
	c := New(application.DefaultApp.Config.Wechat.Applet)
	bytes, err := os.ReadFile("windows_wx109e915f7728f463.wxapkg")
	if err != nil {
		t.Error(err)
		return
	}
	bytes, err = c.DecryptWxapkg(bytes, "wx109e915f7728f463", DefaultSalt, DefaultIV)
	if err != nil {
		t.Error(err)
		return
	}
	filesInfo, err := c.getFilesInfo(bytes)
	if err != nil {
		t.Error(err)
		return
	}
	for _, fileInfo := range filesInfo {
		t.Log(fileInfo)
	}
}

func TestWeChat_ExtractInfo(t *testing.T) {
	c := New(application.DefaultApp.Config.Wechat.Applet)
	wxapkgs, err := c.GetMiniAppWxapkgs("wx109e915f7728f463", "48")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(wxapkgs)
	var filesName []string
	for _, wxapkg := range wxapkgs {
		bytes, _ := os.ReadFile(wxapkg)
		baseFilename := filepath.Base(wxapkg)
		dir := filepath.Join(application.DefaultApp.Config.WechatDataDir, "wx109e915f7728f463", "48", baseFilename[0:len(baseFilename)-7])
		tt, err := c.UnpackWxapkg(bytes, dir, func(err error) {
			fmt.Println(err)
		})
		if err != nil {
			t.Error(err)
			continue
		}
		filesName = append(filesName, tt...)
	}
	c.SetRegex(application.DefaultRegex)
	var results []string
	for _, file := range filesName {
		// 跳过指定后缀本文件
		if utils.StringSliceContain(filteredFileExt, filepath.Ext(file)) {
			continue
		}

		bytes, err := os.ReadFile(file)
		if err != nil {
			continue
		}
		results = append(results, c.ExtractInfo(string(bytes))...)
	}
	results = utils.RemoveEmptyAndDuplicateString(results)
	t.Log(results)
}

func TestWeChat_GetAllMiniAppWxapkg(t *testing.T) {
	c := New(application.DefaultApp.Config.Wechat.Applet)
	wxapkgs, err := c.GetAllMiniAppWxapkgs()
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(wxapkgs)
}

func TestWeChat_QueryMimiAPPInfo(t *testing.T) {
	c := New(application.DefaultApp.Config.Wechat.Applet)
	pm := proxy.NewManager()
	c.UseProxyManager(pm)
	pm.SetProxy("http://127.0.0.1:8081")
	info, err := c.QueryMimiAPPInfo("wx2c348cf579062e56")
	if err != nil {
		t.Error(err)
		return
	}
	bytes, _ := json.Marshal(info)
	t.Log(string(bytes))
}
