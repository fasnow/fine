package repository

import (
	"fine/backend/database/models"
	"fine/backend/logger"
	"fine/backend/service/model/icp"
	"gorm.io/gorm"
)

type IcpRepository interface {
	CreateBulk(taskID int64, items []*icp.Item) error
	GetBulkByTaskID(taskID int64) ([]*models.ICP, error)
	GetByPaginationAndTaskID(taskID int64, pageNum, pageSize int) ([]*models.ICP, error)
	CreateQueryField(item *models.ICPQueryLog, taskID int64) error
	GetQueryFieldByTaskID(taskID int64) (*models.ICPQueryLog, error)
}

type IcpRepositoryImpl struct {
	db *gorm.DB
}

func NewIcpRepository(db *gorm.DB) IcpRepository {
	return &IcpRepositoryImpl{
		db: db,
	}
}

func (r *IcpRepositoryImpl) CreateBulk(taskID int64, items []*icp.Item) error {
	dbItems := make([]*models.ICP, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ICP{
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

func (r *IcpRepositoryImpl) GetBulkByTaskID(taskID int64) ([]*models.ICP, error) {
	items := make([]*models.ICP, 0)
	if err := r.db.Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *IcpRepositoryImpl) GetByPaginationAndTaskID(taskID int64, pageNum, pageSize int) ([]*models.ICP, error) {
	var offset = (pageNum - 1) * pageSize
	var items = make([]*models.ICP, 0)
	if err := r.db.Model(&models.Fofa{}).Limit(pageSize).Offset(offset).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *IcpRepositoryImpl) CreateQueryField(item *models.ICPQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := r.db.Create(item).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (r *IcpRepositoryImpl) GetQueryFieldByTaskID(taskID int64) (*models.ICPQueryLog, error) {
	item := &models.ICPQueryLog{}
	if err := r.db.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return item, nil
}

func (r *IcpRepositoryImpl) History(key string, limit int) ([]string, error) {
	var item []string
	err := r.db.Model(&ICPQueryLog{}).
		Select("distinct(unit_name)").
		Where("unit_name =?", key).
		Order("created_at desc").
		Limit(limit).
		Pluck("unit_name", &item).Error
	if err != nil {
		return nil, err
	}
	return item, nil
}
