package models

import "fine/backend/constant"

type History struct {
	BaseModel
	Key  string
	Type constant.HistoryType
}
