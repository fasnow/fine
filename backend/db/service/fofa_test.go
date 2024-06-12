package service

import (
	"fine/backend/db"
	"fine/backend/service/model/fofa"
	"github.com/yitter/idgenerator-go/idgen"
	"testing"
)

func TestFofaDBService_BatchInsert(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	service := NewFofaDBService()
	taskID := idgen.NextId()
	items := []*fofa.Item{
		{Link: "baidu.com"},
		{Link: "baidu.com"},
		{Link: "baidu.com"},
		{Link: "baidu.com"},
	}
	err := service.BatchInsert(taskID, items)
	if err != nil {
		t.Error(err)
		return
	}
}

func TestFofaDBService_GetByTaskID(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	service := NewFofaDBService()
	items := service.GetByTaskID(504280213479493)
	for _, item := range items {
		t.Log(item.Link)
	}

}
