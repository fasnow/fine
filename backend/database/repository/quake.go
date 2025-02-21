package repository

import (
	"fine/backend/database/models"
	quakeModel "fine/backend/service/model/quake"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type QuakeRepository interface {
	CreateBulk(pageID int64, items []*quakeModel.RealtimeServiceItem) error
	GetBulkByPageID(pageID int64) ([]*models.Quake, error)
	CreateQueryField(item *models.QuakeRealtimeQueryLog, pageID int64) error
	GetQueryFieldByTaskID(pageID int64) (*models.QuakeRealtimeQueryLog, error)
}

type QuakeRepositoryImpl struct {
	db *gorm.DB
}

func NewQuakeRepository(db *gorm.DB) QuakeRepository {
	return &QuakeRepositoryImpl{
		db: db,
	}
}

func (r *QuakeRepositoryImpl) CreateBulk(pageID int64, items []*quakeModel.RealtimeServiceItem) error {
	dbItems := make([]*models.Quake, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.Quake{
			RealtimeServiceItem: tmp,
			PageID:              pageID,
		})
	}

	// 预加载关联数据，以便在插入时同时处理关联关系
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *QuakeRepositoryImpl) GetBulkByPageID(pageID int64) ([]*models.Quake, error) {
	items := make([]*models.Quake, 0)
	if err := r.db.Preload("Service").Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *QuakeRepositoryImpl) CreateQueryField(item *models.QuakeRealtimeQueryLog, pageID int64) error {
	item.PageID = pageID
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *QuakeRepositoryImpl) GetQueryFieldByTaskID(pageID int64) (*models.QuakeRealtimeQueryLog, error) {
	item := &models.QuakeRealtimeQueryLog{}
	if err := r.db.Where("page_id = ?", pageID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
