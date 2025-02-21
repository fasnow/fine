package repository

import (
	"fine/backend/constant/status"
	"fine/backend/database/models"
	"gorm.io/gorm"
	"os"
	"path/filepath"
)

type ExportLogRepository interface {
	FindByExportID(exportID int64) (*models.ExportLog, error)
	Create(item *models.ExportLog) error
	UpdateByExportID(item *models.ExportLog) error
	MarkAsDeleted(exportID int64) error
	MarkAllAsDeleted() error
	MarkRunningAsError() error
	DeleteAll() error
	GetByOffset(offset, limit int) (map[string]any, error)
	GetByPagination(pageNum, pageSize int) ([]*models.ExportLog, int64, error)
}
type ExportLogRepositoryImpl struct {
	db *gorm.DB
}

func (r *ExportLogRepositoryImpl) MarkRunningAsError() error {
	return r.db.Model(&models.ExportLog{}).Where("status = ?", status.Running).Updates(map[string]any{"status": status.Error, "error": "导出中断"}).Error
}

func (r *ExportLogRepositoryImpl) Create(item *models.ExportLog) error {
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *ExportLogRepositoryImpl) FindByExportID(pageID int64) (*models.ExportLog, error) {
	result := &models.ExportLog{}
	if err := r.db.Model(&models.ExportLog{}).Where("export_id = ?", pageID).Find(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *ExportLogRepositoryImpl) UpdateByExportID(item *models.ExportLog) error {
	return r.db.Where("export_id = ?", item.ExportID).Updates(item).Error
}

func (r *ExportLogRepositoryImpl) MarkAsDeleted(pageID int64) error {
	var logItem = &models.ExportLog{}
	if err := r.db.Where("export_id = ?", pageID).Limit(1).Find(logItem).Error; err != nil {
		return err
	}
	if err := os.Remove(filepath.Join(logItem.Dir, logItem.Filename)); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

// MarkAllAsDeleted 清空记录，文件仍存在
func (r *ExportLogRepositoryImpl) MarkAllAsDeleted() error {
	if err := r.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.ExportLog{}).Error; err != nil {
		return err
	}
	return nil
}

// DeleteAll 全删包括文件
func (r *ExportLogRepositoryImpl) DeleteAll() error {
	return nil
}

func (r *ExportLogRepositoryImpl) GetByPagination(pageNum, pageSize int) ([]*models.ExportLog, int64, error) {
	var total int64
	var items = make([]*models.ExportLog, 0)
	r.db.Model(&models.ExportLog{}).Count(&total)
	if total == 0 {
		return items, 0, nil
	}
	if pageNum <= 0 {
		pageNum = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	var offset = (pageNum - 1) * pageSize
	if err := r.db.Model(&models.ExportLog{}).Order("created_at desc").Limit(pageSize).Offset(offset).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	for _, item := range items {
		_, err := os.Stat(item.Filename)
		if os.IsNotExist(err) {
			item.Status = status.Deleted
		}
	}
	return items, total, nil
}

func (r *ExportLogRepositoryImpl) GetByOffset(offset, limit int) (map[string]any, error) {
	//wails最多支持2个返回值
	var total int64
	var items = make([]*models.ExportLog, 0)
	r.db.Model(&models.ExportLog{}).Count(&total)
	if total == 0 {
		//return items, nil
		return map[string]any{
			"total": total,
			"items": items,
		}, nil
	}
	if err := r.db.Model(&models.ExportLog{}).Order("created_at desc").Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		return nil, err
	}
	for _, item := range items {
		// 正在导出完成的进行判断
		if item.Status == status.Stopped {
			_, err := os.Stat(filepath.Join(item.Dir, item.Filename))
			if os.IsNotExist(err) {
				item.Status = status.Deleted
			}
		}
	}
	//return items, nil
	return map[string]any{
		"total": total,
		"items": items,
	}, nil
}

func NewExportLogRepository(db *gorm.DB) ExportLogRepository {
	return &ExportLogRepositoryImpl{db: db}
}
