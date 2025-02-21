package models

import "fine/backend/service/model/fofa"

type Fofa struct {
	BaseModel
	PageID int64
	*fofa.Item
}

type FOFAQueryLog struct {
	BaseModel
	PageID  int64 `gorm:"unique"`
	Query   string
	Fields  string
	Full    bool
	Total   int64
	MaxPage int
}
