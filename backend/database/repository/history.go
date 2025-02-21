package repository

import (
	"fine/backend/database/models"
	"fmt"
	"gorm.io/gorm"
	"strconv"
)

type HistoryRepository interface {
	CreateHistory(history *models.History) error
	FindByPartialKey(ht int, key string, limit int) ([]*models.History, error)
}

type HistoryRepositoryImpl struct {
	db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
	return &HistoryRepositoryImpl{
		db: db,
	}
}

func (r *HistoryRepositoryImpl) CreateHistory(history *models.History) error {
	return r.db.Create(history).Error
}

// FindByPartialKey 通过部分 key 模糊查询历史记录
func (r *HistoryRepositoryImpl) FindByPartialKey(ht int, key string, limit int) ([]*models.History, error) {
	var items []*models.History
	subQuery := `
        SELECT key, max(created_at) as max_created_at
        FROM histories
        WHERE key LIKE '%` + key + `%' AND type = ` + strconv.Itoa(ht) + `
        GROUP BY key
        ORDER BY max_created_at DESC
    `
	err := r.db.Model(&models.History{}).
		Select("histories.*").
		Joins(fmt.Sprintf("JOIN (%s) AS sub ON histories.key = sub.key AND histories.created_at = sub.max_created_at", subQuery)).
		Order("sub.max_created_at DESC").
		Limit(limit).
		Find(&items).Error

	if err != nil {
		return nil, err
	}
	return items, nil
}
