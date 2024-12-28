package models

import (
	"fine/backend/service/model/icp"
)

type ICP struct {
	BaseModel
	TaskID int64
	*icp.Item
}

type ICPQueryLog struct {
	BaseModel
	TaskID      int64 `gorm:"unique"`
	UnitName    string
	ServiceType string
	Total       int
}
