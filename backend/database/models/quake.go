package models

import (
	"fine/backend/service/model"
	quakeModel "fine/backend/service/model/quake"
)

type Quake struct {
	BaseModel
	TaskID int64
	*quakeModel.RealtimeServiceItem
}

type QuakeRealtimeQueryLog struct {
	BaseModel
	TaskID      int64 `gorm:"unique"`
	Query       string
	Rule        string
	IpList      model.StringArray
	Page        int
	PageSize    int
	IgnoreCache bool
	StartTime   string
	EndTime     string
	Include     model.StringArray
	Exclude     model.StringArray
	Latest      bool //仅用于实时服务数据查询
}
