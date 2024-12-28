package models

type CacheTotal struct {
	BaseModel
	TaskID int64
	Total  int64
	Query  string
}
