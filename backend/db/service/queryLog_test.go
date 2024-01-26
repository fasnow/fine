package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"github.com/yitter/idgenerator-go/idgen"
	"testing"
	"time"
)

func TestQueryOptionsService_Add(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	s := NewICPQueryLog()
	taskID := idgen.NextId()
	options := &model.IcpExportCacheItem{
		Page:     1,
		Size:     2,
		UnitName: "",
		Total:    0,
		Status:   0,
		Filename: "",
	}

	err := s.Add(options, taskID)
	if err != nil {
		t.Error(err)
		return
	}
}

func TestQueryOptionsService_GetByTaskID(t *testing.T) {
	db.SetDBAbsFilepath("data.db")
	s := NewICPQueryLog()

	options, err := s.GetByTaskID(503150925496389)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(options)
	t.Log(options.CreatedAt.After(time.Now().Add(5 * time.Minute)))
}
