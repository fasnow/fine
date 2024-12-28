package repository

import (
	"fine/backend/database/models"
	"fine/backend/service/model/hunter"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type HunterRepository interface {
	CreateBulk(taskID int64, items []*hunter.Item) error
	GetBulkByTaskID(taskID int64) ([]*models.Hunter, error)
	GetByPaginationAndTaskID(taskID int64, pageNum, pageSize int) ([]*models.Hunter, error)
	CreateQueryField(item *models.HunterQueryLog, taskID int64) error
	GetQueryFieldByTaskID(taskID int64) (*models.HunterQueryLog, error)
}

type HunterRepositoryImpl struct {
	db *gorm.DB
}

func NewHunterRepository(db *gorm.DB) HunterRepository {
	return &HunterRepositoryImpl{
		db: db,
	}
}

func (r *HunterRepositoryImpl) CreateBulk(taskID int64, items []*hunter.Item) error {
	dbItems := make([]*models.Hunter, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.Hunter{
			Item:   tmp,
			TaskID: taskID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *HunterRepositoryImpl) GetBulkByTaskID(taskID int64) ([]*models.Hunter, error) {
	items := make([]*models.Hunter, 0)
	if err := r.db.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *HunterRepositoryImpl) GetByPaginationAndTaskID(taskID int64, page, pageSize int) ([]*models.Hunter, error) {
	var offset = (page - 1) * pageSize
	var items = make([]*models.Hunter, 0)
	if err := r.db.Preload(clause.Associations).Model(&models.Hunter{}).Limit(pageSize).Offset(offset).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *HunterRepositoryImpl) CreateQueryField(item *models.HunterQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *HunterRepositoryImpl) GetQueryFieldByTaskID(taskID int64) (*models.HunterQueryLog, error) {
	item := &models.HunterQueryLog{}
	if err := r.db.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
