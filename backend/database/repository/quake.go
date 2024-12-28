package repository

import (
	"fine/backend/database/models"
	quakeModel "fine/backend/service/model/quake"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type QuakeRepository interface {
	CreateBulk(taskID int64, items []quakeModel.RealtimeServiceItem) error
	GetBulkByTaskID(taskID int64) ([]*models.Quake, error)
	CreateQueryField(item *models.QuakeRealtimeQueryLog, taskID int64) error
	GetQueryFieldByTaskID(taskID int64) (*models.QuakeRealtimeQueryLog, error)
}

type QuakeRepositoryImpl struct {
	db *gorm.DB
}

func NewQuakeRepository(db *gorm.DB) QuakeRepository {
	return &QuakeRepositoryImpl{
		db: db,
	}
}

func (r *QuakeRepositoryImpl) CreateBulk(taskID int64, items []quakeModel.RealtimeServiceItem) error {
	dbItems := make([]*models.Quake, 0)
	for _, item := range items {
		dbItems = append(dbItems, &models.Quake{
			RealtimeServiceItem: &item,
			TaskID:              taskID,
		})
	}

	// 预加载关联数据，以便在插入时同时处理关联关系
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *QuakeRepositoryImpl) GetBulkByTaskID(taskID int64) ([]*models.Quake, error) {
	items := make([]*models.Quake, 0)
	if err := r.db.Preload("Service").Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *QuakeRepositoryImpl) CreateQueryField(item *models.QuakeRealtimeQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *QuakeRepositoryImpl) GetQueryFieldByTaskID(taskID int64) (*models.QuakeRealtimeQueryLog, error) {
	item := &models.QuakeRealtimeQueryLog{}
	if err := r.db.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
