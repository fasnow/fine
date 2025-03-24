package models

import (
	quakeModel "fine/backend/service/model/quake"
	"gorm.io/datatypes"
)

type Quake struct {
	BaseModel
	PageID int64
	*quakeModel.RealtimeServiceItem
}

type QuakeRealtimeQueryLog struct {
	BaseModel
	PageID      int64 `gorm:"unique"`
	Query       string
	Rule        string
	IpList      datatypes.JSONSlice[string]
	Page        int
	PageSize    int
	IgnoreCache bool
	StartTime   string
	EndTime     string
	Include     datatypes.JSONSlice[string]
	Exclude     datatypes.JSONSlice[string]
	Latest      bool //仅用于实时服务数据查询
}
