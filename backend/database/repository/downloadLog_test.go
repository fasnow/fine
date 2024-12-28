package repository

import (
	"fine/backend/database"
	"fine/backend/database/models"
	"fmt"
	"github.com/yitter/idgenerator-go/idgen"
	"testing"
)

func TestDownloadLogService_Insert(t *testing.T) {
	database.Init("data.db")
	service := NewDownloadLogService()
	taskID := idgen.NextId()
	err := service.Insert(models.DownloadLog{
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
	database.Init("data.db")
	service := NewDownloadLogService()
	items, err := service.GetByOffset(0, 10)
	if err != nil {
		t.Log(err)
		return
	}
	fmt.Println(items)
}
