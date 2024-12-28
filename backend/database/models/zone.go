package models

import "fine/backend/service/model/zone"

type ZoneSite struct {
	BaseModel
	TaskID int64
	*zone.SiteItem
}

type ZoneDomain struct {
	BaseModel
	TaskID int64
	*zone.DomainItem
}

type ZoneApk struct {
	BaseModel
	TaskID int64
	*zone.ApkItem
}
type ZoneMember struct {
	BaseModel
	TaskID int64
	*zone.MemberItem
}
type ZoneEmail struct {
	BaseModel
	TaskID int64
	*zone.EmailItem
}
type ZoneCode struct {
	BaseModel
	TaskID int64
	*zone.CodeItem
}
type ZoneDwm struct {
	BaseModel
	TaskID int64
	*zone.DarknetItem
}
type ZoneAim struct {
	BaseModel
	TaskID int64
	*zone.AimItem
}

type ZoneQueryLog struct {
	BaseModel
	TaskID    int64 `gorm:"unique"`
	Query     string
	QueryType zone.QueryType
	Page      int
	PageSize  int
}
