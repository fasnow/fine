package model

import (
	"fine/backend/service/model/wechat"
)

type MiniProgram struct {
	*BaseModel
	wechat.MiniProgram
}
