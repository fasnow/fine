package models

import (
	"fine/backend/service/model/wechat"
)

type MiniProgramDecompileTask struct {
	BaseModel
	*wechat.MiniProgram
	Status   int
	Versions []*VersionDecompileTask `gorm:"foreignKey:AppID;references:AppID"` // 一对多关系
}
type VersionDecompileTask struct {
	BaseModel
	AppID string
	*wechat.Version
	DecompileStatus int
	MatchStatus     int
	Matched         string
}

type Info struct {
	BaseModel
	*wechat.Info
}
