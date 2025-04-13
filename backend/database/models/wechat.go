package models

import (
	"fine/backend/matcher"
	"fine/backend/service/model/wechat"

	"gorm.io/datatypes"
)

type MiniAppDecompileTask struct {
	BaseModel
	*wechat.MiniAppBaseInfo
	Versions []*VersionDecompileTask `gorm:"foreignKey:AppID;references:AppID"` // 一对多关系
}
type VersionDecompileTask struct {
	BaseModel
	AppID string
	*wechat.Version
	DecompileStatus int
	MatchStatus     int
	Matched         string
	MatchedV2       datatypes.JSONType[[]matcher.MatchResult]
	Message         string
}

type Info struct {
	BaseModel
	*wechat.Info
}
