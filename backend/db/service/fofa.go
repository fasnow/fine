package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"fine/backend/logger"
	"fine/backend/service/model/fofa"
	"gorm.io/gorm"
)

type FofaDBService struct {
	dbConn *gorm.DB
}

func NewFofaDBService() *FofaDBService {
	return &FofaDBService{dbConn: db.GetDBConnect()}
}

func (f *FofaDBService) BatchInsert(taskID int64, items []*fofa.Item) error {
	dbItems := make([]*model.Fofa, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.Fofa{
			Item:   tmp,
			TaskID: taskID,
		})
	}
	if err := f.dbConn.Create(&dbItems).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (f *FofaDBService) GetByTaskID(taskID int64) []*model.Fofa {
	items := make([]*model.Fofa, 0)
	f.dbConn.Where("task_id = ?", taskID).Find(&items)
	return items
}

func (f *FofaDBService) GetByPaginationAndTaskID(taskID int64, page, pageSize int) []*model.Fofa {
	var offset = (page - 1) * pageSize
	var items = make([]*model.Fofa, 0)
	f.dbConn.Model(&model.Fofa{}).Limit(pageSize).Offset(offset).Where("task_id = ?", taskID).Find(&items)
	return items
}
