package model

import (
	"fine/backend/service/model"
	"fine/backend/service/model/zone"
)

type ICPQueryLog struct {
	BaseModel
	TaskID      int64 `gorm:"unique"`
	UnitName    string
	ServiceType string
}

type FOFAQueryLog struct {
	BaseModel
	TaskID  int64 `gorm:"unique"`
	Query   string
	Fields  string
	Full    bool
	Total   int64
	MaxPage int
}

type HunterQueryLog struct {
	BaseModel
	TaskID     int64 `gorm:"unique"`
	Query      string
	StartTime  string
	EndTime    string
	Page       int
	PageSize   int
	IsWeb      int
	StatusCode string
	PortFilter bool
	Total      int64
	MaxPage    int
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

type ZoneQueryLog struct {
	BaseModel
	TaskID    int64 `gorm:"unique"`
	Query     string
	QueryType zone.QueryType
	Page      int
	PageSize  int
}

type CacheTotal struct {
	BaseModel
	TaskID int64
	Total  int64
	Query  string
}
