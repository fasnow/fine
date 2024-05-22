package model

import (
	"fine/backend/service/model/wechat"
)

type MiniProgram struct {
	*BaseModel
	wechat.MiniProgram
}

type MatchedString struct {
	*BaseModel
	WxID     string
	Version  int64
	TaskDown bool
	Matched  string
}
