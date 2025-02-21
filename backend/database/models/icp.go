package models

import (
	"fine/backend/service/model/icp"
)

type ICP struct {
	BaseModel
	PageID int64
	*icp.Item
}

type ICPQueryLog struct {
	BaseModel
	PageID      int64 `gorm:"unique"`
	UnitName    string
	ServiceType string
	Total       int
}

type ICPTask struct {
	BaseModel
	*icp.Task
	TaskSlices []*ICPTaskSlice `gorm:"foreignKey:TaskID;references:TaskID"` // 一对多关系
}

type ICPTaskSlice struct {
	BaseModel
	TaskID      int64  `gorm:"not null"`
	UnitToQuery string // 查询关键字
	Status      int    // 记录是否查询过
	ServiceType string
	Items       []*ItemWithID `gorm:"foreignKey:SliceID"`
}

type ItemWithID struct {
	BaseModel
	SliceID int64 `gorm:"not null"`
	TaskID  int64
	*icp.Item
}
