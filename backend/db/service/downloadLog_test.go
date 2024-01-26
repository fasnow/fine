package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"fmt"
	"github.com/yitter/idgenerator-go/idgen"
	"testing"
)

func TestDownloadLogService_Insert(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	service := NewDownloadLogService()
	taskID := idgen.NextId()
	err := service.Insert(model.DownloadLog{
		Filename: "2.txt",
		Dir:      "",
		Deleted:  false,
		FileID:   1,
		Status:   1,
		Message:  "",
	}, taskID)
	if err != nil {
		t.Log(err)
		return
	}
}

func TestDownloadLogService_GetByOffset(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	service := NewDownloadLogService()
	items, err := service.GetByOffset(0, 10)
	if err != nil {
		t.Log(err)
		return
	}
	fmt.Println(items)
}
