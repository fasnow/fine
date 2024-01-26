package model

import (
	"fine/backend/sdk/model/fofa"
	"fine/backend/sdk/model/hunter"
	quakeModel "fine/backend/sdk/model/quake"
	"fine/backend/sdk/model/zone"
)

type Fofa struct {
	BaseModel
	TaskID int64
	*fofa.Item
}

type Hunter struct {
	BaseModel
	TaskID int64
	*hunter.Item
}

type HunterRestToken struct {
	BaseModel
	Total int
}

type Quake struct {
	BaseModel
	TaskID int64
	*quakeModel.RealtimeServiceItem
}

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
