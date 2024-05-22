package wechat

import (
	"fine/backend/logger"
	"fine/backend/utils"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"testing"
)

func TestDecrypt(t *testing.T) {
	bytes, err := os.ReadFile("D:\\AppAutoDownloadFiles\\WeChat\\WeChat Files\\Applet\\wx7605335e224edc7b\\161\\__APP__.wxapkg")
	if err != nil {
		t.Error(err)
		return
	}
	decrypt, err := decrypt(bytes, "wx7605335e224edc7b", "saltiest", "the iv: 16 bytes")
	if err != nil {
		return
	}
	if err := utils.WriteFile("1.wxapkg", decrypt, 0666); err != nil {
		t.Error(err)
		return
	}
}

func TestBridge_extract(t *testing.T) {
	//version := strconv.Itoa(int(versionID))
	//targetDir := filepath.Join(config.GlobalConfig.WechatDataPath, appid, version)
	targetDir := "C:\\Users\\fasnow\\Desktop\\Fine-amd64\\data\\wechatMiniProgram\\wx25f982a55e60a540\\365"

	regexPattern := "http.*?\\s+"
	regex, err := regexp.Compile(regexPattern)
	if err != nil {
		logger.Info(err)
		return
	}

	var matched []string
	err = filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			logger.Info(err)
			return nil
		}
		if !info.IsDir() {
			// 读取文件内容
			content, err := os.ReadFile(path)
			if err != nil {
				logger.Info(err)
				return nil
			}
			matches := regex.FindAllStringSubmatch(string(content), -1)
			for _, match := range matches {
				matched = append(matched, match[0])
			}
		}
		return nil
	})
	if err != nil {
		logger.Info(err)
	}
	fmt.Println(matched)
}
