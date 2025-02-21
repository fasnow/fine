package models

import "fine/backend/service/model/zone"

type ZoneSite struct {
	BaseModel
	PageID int64
	*zone.SiteItem
}

type ZoneDomain struct {
	BaseModel
	PageID int64
	*zone.DomainItem
}

type ZoneApk struct {
	BaseModel
	PageID int64
	*zone.ApkItem
}
type ZoneMember struct {
	BaseModel
	PageID int64
	*zone.MemberItem
}
type ZoneEmail struct {
	BaseModel
	PageID int64
	*zone.EmailItem
}
type ZoneCode struct {
	BaseModel
	PageID int64
	*zone.CodeItem
}
type ZoneDwm struct {
	BaseModel
	PageID int64
	*zone.DarknetItem
}
type ZoneAim struct {
	BaseModel
	PageID int64
	*zone.AimItem
}

type ZoneQueryLog struct {
	BaseModel
	PageID    int64 `gorm:"unique"`
	Query     string
	QueryType zone.QueryType
	Page      int
	PageSize  int
}
