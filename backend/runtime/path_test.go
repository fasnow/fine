package runtime

import (
	"encoding/json"
	"testing"
)

func TestPath_GetAbsFilenameAllByDir(t *testing.T) {
	r := &Path{}
	got, err := r.GetAbsFilenameAllByDir("D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189", "")
	if err != nil {
		t.Log(err)
	}
	marshal, err := json.Marshal(got)
	if err != nil {
		return
	}
	t.Log(string(marshal))
}
