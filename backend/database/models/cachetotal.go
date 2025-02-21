package models

type CacheTotal struct {
	BaseModel
	PageID int64
	Total  int64
	Query  string
}
