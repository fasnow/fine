package repository

import (
	"fine/backend/database/models"
	"fine/backend/logger"
	"fine/backend/service/model/fofa"
	"gorm.io/gorm"
)

type FofaRepository interface {
	BatchInsert(taskID int64, items []*fofa.Item) error
	GetByTaskID(taskID int64) []*models.Fofa
	GetByPaginationAndTaskID(taskID int64, pageNum, pageSize int) ([]*models.Fofa, error)
	CreateQueryField(item *models.FOFAQueryLog, taskID int64) error
	GetQueryFieldByTaskID(taskID int64) (*models.FOFAQueryLog, error)
}

type FofaRepositoryImpl struct {
	db *gorm.DB
}

func NewFofaRepository(db *gorm.DB) FofaRepository {
	return &FofaRepositoryImpl{
		db: db,
	}
}

func (r *FofaRepositoryImpl) BatchInsert(taskID int64, items []*fofa.Item) error {
	dbItems := make([]*models.Fofa, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.Fofa{
			Item:   tmp,
			TaskID: taskID,
		})
	}
	if err := r.db.Create(&dbItems).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (r *FofaRepositoryImpl) GetByTaskID(taskID int64) []*models.Fofa {
	items := make([]*models.Fofa, 0)
	r.db.Where("task_id = ?", taskID).Find(&items)
	return items
}

func (r *FofaRepositoryImpl) GetByPaginationAndTaskID(taskID int64, pageNum, pageSize int) ([]*models.Fofa, error) {
	var offset = (pageNum - 1) * pageSize
	var items = make([]*models.Fofa, 0)
	if err := r.db.Model(&models.Fofa{}).Limit(pageSize).Offset(offset).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *FofaRepositoryImpl) CreateQueryField(item *models.FOFAQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := r.db.Create(item).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (r *FofaRepositoryImpl) GetQueryFieldByTaskID(taskID int64) (*models.FOFAQueryLog, error) {
	item := &models.FOFAQueryLog{}
	if err := r.db.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return item, nil
}
