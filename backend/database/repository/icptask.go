package repository

import (
	"fine/backend/constant/status"
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type IcpTaskRepository interface {
	Create(task *models.ICPTask) error
	GetByTaskID(taskID int64, associationDetails bool) (*models.ICPTask, error)
	GetBulkByPagination(pageNum, pageSize int) ([]*models.ICPTask, int, error)
	FindByPartialKeyAndTaskID(unitName string, pageNum, pageSize int, taskID int64) ([]*models.ItemWithID, int, error)
	Delete(taskID int64) error
	UpdateAllTaskToPaused() error
	UpdateName(taskID int64, name string) error
	Update(task *models.ICPTask) error
	UpdateTaskSlice(slices *models.ICPTaskSlice) error
	FindByPartialKey(key string, pageNum, pageSize int) ([]*models.ICPTask, int, error)
	FindResultByPartialKey(key string, taskID int64) ([]*models.ItemWithID, error)
	GetRunningTasks() ([]*models.ICPTask, error)
	GetSliceByTaskID(taskID int64) ([]*models.ICPTaskSlice, error)
	ResetTask(taskID int64) error
}

type IcpTaskRepositoryImpl struct {
	db *gorm.DB
}

func (r *IcpTaskRepositoryImpl) FindResultByPartialKey(key string, taskID int64) ([]*models.ItemWithID, error) {
	var items = make([]*models.ItemWithID, 0)
	err := r.db.Model(&models.ItemWithID{}).
		Where("unit_name LIKE ? AND task_id = ?", "%"+key+"%", taskID).
		Order("created_at DESC").
		Find(&items).Error
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (r *IcpTaskRepositoryImpl) ResetTask(taskID int64) error {
	// 开启事务
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. 更新 ICPTask
		if err := tx.Model(&models.ICPTask{}).
			Where("task_id = ?", taskID).
			Updates(map[string]interface{}{"status": status.Waiting, "message": "", "current": 0, "time_spent": 0}).
			Error; err != nil {
			return err
		}

		// 2. 更新所有关联的 ICPTaskSlice
		if err := tx.Model(&models.ICPTaskSlice{}).
			Where("task_id = ?", taskID).
			Update("status", status.Waiting).
			Update("current_page", 1).Error; err != nil {
			return err
		}

		// 3. 获取所有关联的 ICPTaskSlice 的 ID（用于删除 Items）
		var sliceIDs []int64
		if err := tx.Model(&models.ICPTaskSlice{}).
			Where("task_id = ?", taskID).
			Pluck("id", &sliceIDs).Error; err != nil {
			return err
		}

		// 4. 删除所有关联的 ItemWithID
		if len(sliceIDs) > 0 {
			if err := tx.Where("slice_id IN ?", sliceIDs).
				Delete(&models.ItemWithID{}).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *IcpTaskRepositoryImpl) FindByPartialKeyAndTaskID(unitName string, pageNum, pageSize int, taskID int64) ([]*models.ItemWithID, int, error) {
	var offset = (pageNum - 1) * pageSize
	var total int64
	likeValue := "%" + unitName + "%"

	// 先查询总数
	if err := r.db.Model(&models.ItemWithID{}).
		Where("unit_name LIKE ? AND task_id = ?", likeValue, taskID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var items = make([]*models.ItemWithID, 0)
	err := r.db.Model(&models.ItemWithID{}).
		Where("unit_name LIKE ? AND task_id = ?", likeValue, taskID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&items).Error
	if err != nil {
		return nil, 0, err
	}

	return items, int(total), nil
}

func (r *IcpTaskRepositoryImpl) GetRunningTasks() ([]*models.ICPTask, error) {
	var tasks []*models.ICPTask
	if err := r.db.Where("status = ?", status.Running).Find(&tasks).Error; err != nil {
		return nil, err
	}
	return tasks, nil
}

func (r *IcpTaskRepositoryImpl) Delete(taskID int64) error {
	// 开启事务
	return r.db.Transaction(func(tx *gorm.DB) error {
		task := &models.ICPTask{}
		if err := tx.Where("task_id = ?", taskID).First(task).Error; err != nil {
			return err
		}

		var sliceIDs []int64
		if err := tx.Model(&models.ICPTaskSlice{}).
			Where("task_id = ?", task.TaskID).
			Pluck("id", &sliceIDs).Error; err != nil {
			return err
		}

		// 删除任务
		if err := tx.Delete(task).Error; err != nil {
			return err
		}

		// 删除关联的所有 ICPTaskSlice
		if err := tx.Where("task_id", task.TaskID).Delete(&models.ICPTaskSlice{}).Error; err != nil {
			return err
		}

		// 删除 ICPTaskSlice 关联的所有 ItemWithID
		if len(sliceIDs) > 0 {
			if err := tx.Where("slice_id IN ?", sliceIDs).
				Delete(&models.ItemWithID{}).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *IcpTaskRepositoryImpl) GetByTaskID(taskID int64, associationDetails bool) (*models.ICPTask, error) {
	task := &models.ICPTask{}
	if associationDetails {
		if err := r.db.Model(&models.ICPTask{}).Where("task_id = ?", taskID).Preload("TaskSlices").Find(task).Error; err != nil {
			return nil, err
		}
		return task, nil
	}
	if err := r.db.Model(&models.ICPTask{}).Where("task_id = ?", taskID).Find(task).Error; err != nil {
		return nil, err
	}
	return task, nil
}

func (r *IcpTaskRepositoryImpl) GetSliceByTaskID(taskID int64) ([]*models.ICPTaskSlice, error) {
	var items []*models.ICPTaskSlice
	if err := r.db.Model(&models.ICPTaskSlice{}).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *IcpTaskRepositoryImpl) UpdateName(taskID int64, name string) error {
	if err := r.db.Model(&models.ICPTask{}).Where("task_id = ?", taskID).Update("name", name).Error; err != nil {
		return err
	}
	return nil
}

func (r *IcpTaskRepositoryImpl) Update(task *models.ICPTask) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Updates(task).Error
}

func (r *IcpTaskRepositoryImpl) UpdateTaskSlice(slice *models.ICPTaskSlice) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Updates(slice).Error
}

func (r *IcpTaskRepositoryImpl) UpdateAllTaskToPaused() error {
	if err := r.db.Model(&models.ICPTask{}).Where("status = ? OR status = ?", status.Running, status.Pausing).Update("status", status.Paused).Error; err != nil {
		return err
	}
	return nil
}

func (r *IcpTaskRepositoryImpl) Create(task *models.ICPTask) error {
	if err := r.db.Create(task).Error; err != nil {
		return err
	}
	return nil
}

func (r *IcpTaskRepositoryImpl) GetBulkByPagination(pageNum, pageSize int) ([]*models.ICPTask, int, error) {
	var offset = (pageNum - 1) * pageSize
	var items = make([]*models.ICPTask, 0)
	var total int64

	// 先查询总数
	if err := r.db.Model(&models.ICPTask{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 再查询当前页的数据
	if err := r.db.Model(&models.ICPTask{}).Limit(pageSize).Offset(offset).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, int(total), nil
}

func (r *IcpTaskRepositoryImpl) FindByPartialKey(key string, pageNum, pageSize int) ([]*models.ICPTask, int, error) {
	var offset = (pageNum - 1) * pageSize
	var total int64
	likeValue := "%" + key + "%"

	// 先查询总数
	if err := r.db.Model(&models.ICPTask{}).
		Where("name LIKE ?", likeValue).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var items = make([]*models.ICPTask, 0)
	err := r.db.Model(&models.ICPTask{}).
		Where("name LIKE ?", likeValue).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&items).Error
	if err != nil {
		return nil, 0, err
	}

	return items, int(total), nil
}

func NewIcpTaskRepository(db *gorm.DB) IcpTaskRepository {
	return &IcpTaskRepositoryImpl{
		db: db,
	}
}
