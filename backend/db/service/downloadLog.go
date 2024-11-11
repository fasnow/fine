package service

import (
	"fine/backend/db"
	"fine/backend/db/models"
	"fine/backend/logger"
	"gorm.io/gorm"
	"os"
	"path/filepath"
)

type DownloadLogService struct {
	dbConn *gorm.DB
}

func NewDownloadLogService() *DownloadLogService {
	return &DownloadLogService{dbConn: db.GetDBConnect()}
}

func (d *DownloadLogService) Insert(item models.DownloadLog, fileID int64) error {
	item.FileID = fileID
	if err := d.dbConn.Create(&item).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (d *DownloadLogService) MarkAsDeleted(fileId int64) {
	var logItem = &models.DownloadLog{}
	if err := d.dbConn.Where("file_id = ?", fileId).Limit(1).Find(logItem).Error; err != nil {
		logger.Info(err.Error())
		return
	}
	//d.dbConn.Where("file_id = ?", logItem.FileID).Updates(&model.DownloadLog{Deleted: true})
	if err := os.Remove(filepath.Join(logItem.Dir, logItem.Filename)); err != nil && !os.IsNotExist(err) {
		logger.Info(err.Error())
		return
	}
}

// Clear 清空记录，文件仍存在
func (d *DownloadLogService) Clear() error {
	if err := d.dbConn.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.DownloadLog{}).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (d *DownloadLogService) GetByPagination(page, pageSize int) ([]*models.DownloadLog, int64, error) {
	var total int64
	var items = make([]*models.DownloadLog, 0)
	d.dbConn.Model(&models.DownloadLog{}).Count(&total)
	if total == 0 {
		return items, 0, nil
	}
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	var offset = (page - 1) * pageSize
	if err := d.dbConn.Model(&models.DownloadLog{}).Order("created_at desc").Limit(pageSize).Offset(offset).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	for _, item := range items {
		_, err := os.Stat(item.Filename)
		if os.IsNotExist(err) {
			item.Deleted = true
		}
	}
	return items, total, nil
}

func (d *DownloadLogService) GetByOffset(offset, limit int) (map[string]any, error) {
	//wails最多支持2个返回值
	var total int64
	var items = make([]*models.DownloadLog, 0)
	d.dbConn.Model(&models.DownloadLog{}).Count(&total)
	if total == 0 {
		//return items, nil
		return map[string]any{
			"total": total,
			"items": items,
		}, nil
	}
	if err := d.dbConn.Model(&models.DownloadLog{}).Order("created_at desc").Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		return nil, err
	}
	for _, item := range items {
		_, err := os.Stat(filepath.Join(item.Dir, item.Filename))
		if os.IsNotExist(err) {
			item.Deleted = true
		}
	}
	//return items, nil
	return map[string]any{
		"total": total,
		"items": items,
	}, nil
}

func (d *DownloadLogService) GetRunningOrErrorOccurredTask() []*models.ExportStatus {
	var items = make([]*models.DownloadLog, 0)
	var exportStatusList []*models.ExportStatus
	d.dbConn.Where("status <> 0").Find(items)
	for _, item := range items {
		exportStatusList = append(exportStatusList, &models.ExportStatus{
			FileID:  item.FileID,
			Message: item.Message,
		})
	}
	return exportStatusList
}

func (d *DownloadLogService) UpdateStatus(fileID int64, status int, message string) {
	var item = &models.DownloadLog{
		FileID: fileID,
		Status: status,
	}
	if status == -1 {
		item.Message = message
	}
	d.dbConn.Where("file_id = ?", fileID).Updates(item)
}
