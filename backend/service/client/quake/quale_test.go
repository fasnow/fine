package quake

import (
	"fine/backend/db"
	"fine/backend/db/service"
	"fmt"
	"github.com/yitter/idgenerator-go/idgen"
	"testing"
)

func TestQuakeDBService_GetByTaskID(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	client := NewClient("76b63b88-83c5-49ed-bcf5-9c340a75ac39")
	req := NewGetRealtimeDataBuilder().
		Query("baidu.com").
		Page(1).
		Size(1).
		Build()
	result, err := client.Realtime.Service(req)
	if err != nil {
		t.Error(err)
		return
	}
	c := service.NewQuakeDBService()
	id := idgen.NextId()
	err = c.BatchInsert(id, result.Items)
	if err != nil {
		t.Error(err)
		return
	}
	items, err := c.GetByTaskID(id)
	if err != nil {
		t.Error(err)
		return
	}
	for i, item := range items {
		fmt.Println(i, item.Service.HTTP)
	}
}
