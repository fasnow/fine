package wechat

import (
	"encoding/json"
	"fmt"
	"testing"
)

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
