package repository

import (
	"fine/backend/database"
	"fine/backend/database/models"
	"github.com/yitter/idgenerator-go/idgen"
	"testing"
	"time"
)

func TestQueryOptionsService_Add(t *testing.T) {
	database.Init("data.db")
	s := NewICPQueryLog()
	taskID := idgen.NextId()
	options := &models.ICPQueryLog{
		BaseModel: models.BaseModel{},
		TaskID:    0,
		UnitName:  "",
		Total:     0,
	}

	err := s.CreateQueryField(options, taskID)
	if err != nil {
		t.Error(err)
		return
	}
}

func TestQueryOptionsService_GetByTaskID(t *testing.T) {
	database.Init("data.db")
	s := NewICPQueryLog()

	options, err := s.GetQueryFieldByTaskID(503150925496389)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(options)
	t.Log(options.CreatedAt.After(time.Now().Add(5 * time.Minute)))
}
