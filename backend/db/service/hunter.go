package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"fine/backend/sdk/model/hunter"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type HunterDBService struct {
	dbConn *gorm.DB
}

func NewHunterDBService() *HunterDBService {
	return &HunterDBService{dbConn: db.GetDBConnect()}
}

func (f *HunterDBService) BatchInsert(taskID int64, items []*hunter.Item) error {
	dbItems := make([]*model.Hunter, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.Hunter{
			Item:   tmp,
			TaskID: taskID,
		})
	}
	if err := f.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (f *HunterDBService) GetByTaskID(taskID int64) ([]*model.Hunter, error) {
	items := make([]*model.Hunter, 0)
	if err := f.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (f *HunterDBService) GetByPaginationAndTaskID(taskID int64, page, pageSize int) ([]*model.Hunter, error) {
	var offset = (page - 1) * pageSize
	var items = make([]*model.Hunter, 0)
	if err := f.dbConn.Preload(clause.Associations).Model(&model.Hunter{}).Limit(pageSize).Offset(offset).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}
