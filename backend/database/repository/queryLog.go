package repository

import (
	"fine/backend/database"
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type ICPQueryLog struct {
	dbConn *gorm.DB
}

func NewICPQueryLog() *ICPQueryLog {
	return &ICPQueryLog{
		dbConn: database.GetConnection()}
}

type CacheTotal struct {
	dbConn *gorm.DB
}

func NewCacheTotal() *CacheTotal {
	return &CacheTotal{
		dbConn: database.GetConnection()}
}

func (c *CacheTotal) Add(taskID, total int64, query string) {
	c.dbConn.Create(&models.CacheTotal{TaskID: taskID, Total: total, Query: query})
}

func (c *CacheTotal) GetByTaskID(taskID int64) (int64, string) {
	cacheTotal := &models.CacheTotal{}
	c.dbConn.Where("task_id = ?", taskID).Find(cacheTotal)
	return cacheTotal.Total, cacheTotal.Query
}
