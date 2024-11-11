package models

import (
	"fine/backend/service/model/wechat"
)

type MiniProgram struct {
	BaseModel
	wechat.MiniProgram
}

type MatchedString struct {
	BaseModel
	AppID    string `json:"appid"`
	Version  string `json:"version"`
	TaskDown bool   `json:"taskDown"`
	Matched  string `json:"matched"`
}

type Info struct {
	BaseModel
	wechat.Info
}
