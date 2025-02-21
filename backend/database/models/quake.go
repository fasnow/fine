package models

import (
	"fine/backend/constant"
	quakeModel "fine/backend/service/model/quake"
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
	IpList      constant.StringArray
	Page        int
	PageSize    int
	IgnoreCache bool
	StartTime   string
	EndTime     string
	Include     constant.StringArray
	Exclude     constant.StringArray
	Latest      bool //仅用于实时服务数据查询
}
