package repository

import (
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type CacheTotal struct {
	db *gorm.DB
}

func NewCacheTotal(db *gorm.DB) CacheTotal {
	return CacheTotal{
		db: db,
	}
}

func (c *CacheTotal) Add(pageID, total int64, query string) {
	c.db.Create(&models.CacheTotal{PageID: pageID, Total: total, Query: query})
}

func (c *CacheTotal) GetByPageID(pageID int64) (int64, string) {
	cacheTotal := &models.CacheTotal{}
	c.db.Where("page_id = ?", pageID).Find(cacheTotal)
	return cacheTotal.Total, cacheTotal.Query
}
