package repository

import (
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type ProxyHistoryRepository interface {
	Create(item models.ProxyHistory) error
	GetByPagination(pageNum, pageSize int) ([]*models.ProxyHistory, int64, error)
}

type ProxyHistoryRepositoryImpl struct {
	db *gorm.DB
}

func (r ProxyHistoryRepositoryImpl) Create(item models.ProxyHistory) error {
	return r.db.Model(&models.ProxyHistory{}).Create(&item).Error
}

func (r ProxyHistoryRepositoryImpl) GetByPagination(pageNum, pageSize int) ([]*models.ProxyHistory, int64, error) {
	var total int64
	if err := r.db.Model(&models.ProxyHistory{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (pageNum - 1) + pageSize
	items := make([]*models.ProxyHistory, 0)
	if err := r.db.Model(&models.ProxyHistory{}).Find(items).Offset(offset).Limit(pageSize).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func NewProxyHistoryRepository(db *gorm.DB) ProxyHistoryRepository {
	return &ProxyHistoryRepositoryImpl{db: db}
}
