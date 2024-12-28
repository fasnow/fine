package models

import "fine/backend/service/model/hunter"

type Hunter struct {
	BaseModel
	TaskID int64
	*hunter.Item
}

type HunterRestToken struct {
	BaseModel
	Total int
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
