package service

import (
	"fine/backend/db"
	"fine/backend/service/model/wechat"
	"fmt"
	"testing"
)

func TestWechatDBService_UpdateUnpackedStatus(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	s := NewWechatDBService()
	item := s.FindByAppId("wx9def7d78ef44aef3")
	fmt.Println(item)
	err := s.Insert(wechat.MiniProgram{
		AppID:      "wx9def7d78ef44aef3",
		UpdateDate: "",
		Versions: []wechat.Version{
			{Number: "13", Unpacked: false},
		},
	})
	if err != nil {
		t.Log(err)
		return
	}
	if err := s.UpdateUnpackedStatus("wx9def7d78ef44aef3", "13", true); err != nil {
		t.Log(err)
	}
}
