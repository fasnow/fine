package wechat

import (
	"fine/backend/utils"
	"os"
	"testing"
)

func TestDecrypt(t *testing.T) {
	bytes, err := os.ReadFile("D:\\AppAutoDownloadFiles\\WeChat\\WeChat Files\\Applet\\wx7605335e224edc7b\\161\\__APP__.wxapkg")
	if err != nil {
		t.Error(err)
		return
	}
	decrypt, err := Decrypt(bytes, "wx7605335e224edc7b", "saltiest", "the iv: 16 bytes")
	if err != nil {
		return
	}
	if err := utils.WriteFile("1.wxapkg", decrypt, 0666); err != nil {
		t.Error(err)
		return
	}
}
