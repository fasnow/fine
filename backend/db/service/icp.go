package service

import (
	"fine/backend/db"
	"fine/backend/db/models"
	"fine/backend/logger"
	"fine/backend/service/model/icp"
	"gorm.io/gorm"
)

type IcpDBService struct {
	dbConn *gorm.DB
}

func NewIcpDBService() *IcpDBService {
	return &IcpDBService{dbConn: db.GetDBConnect()}
}

func (r *IcpDBService) BatchInsert(taskID int64, items []*icp.Item) error {
	dbItems := make([]*models.ICP, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ICP{
			Item:   tmp,
			TaskID: taskID,
		})
	}
	if err := r.dbConn.Create(&dbItems).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (r *IcpDBService) GetByTaskID(taskID int64) []*models.ICP {
	items := make([]*models.ICP, 0)
	r.dbConn.Where("task_id = ?", taskID).Find(&items)
	return items
}

func (r *IcpDBService) GetByPaginationAndTaskID(taskID int64, pageNum, pageSize int) []*models.ICP {
	var offset = (pageNum - 1) * pageSize
	var items = make([]*models.ICP, 0)
	r.dbConn.Model(&models.Fofa{}).Limit(pageSize).Offset(offset).Where("task_id = ?", taskID).Find(&items)
	return items
}
