package repository

import (
	"fine/backend/constant/status"
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type WechatRepository interface {
	FindInfoByAppID(appid string) (*models.Info, error)
	DeleteAllInfo() error
	CreateInfo(info *models.Info) error
	UpdateInfo(info *models.Info) error
	CreateVersionTask(task *models.MiniAppDecompileTask) error
	AppendVersionTaskByAppID(versions []*models.VersionDecompileTask) error
	FindTaskByAppId(appid string) (*models.MiniAppDecompileTask, error)
	FindVersionTaskByAppIDAndVersionNum(appid, versionNum string) (*models.VersionDecompileTask, error)
	DeleteAllVersionDecompileTask() error
	UpdateVersionTask(version *models.VersionDecompileTask) error
	RestVersionTaskStatus() error
}

type WechatRepositoryImpl struct {
	db *gorm.DB
}

func (r *WechatRepositoryImpl) FindVersionTaskByAppIDAndVersionNum(appid, versionNum string) (*models.VersionDecompileTask, error) {
	result := &models.VersionDecompileTask{}
	if err := r.db.Model(&models.VersionDecompileTask{}).Where("app_id = ? AND number = ?", appid, versionNum).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *WechatRepositoryImpl) CreateVersionTask(task *models.MiniAppDecompileTask) error {
	if err := r.db.Model(&models.MiniAppDecompileTask{}).Create(task).Error; err != nil {
		return err
	}
	return nil
}

func (r *WechatRepositoryImpl) UpdateVersionTask(task *models.VersionDecompileTask) error {
	return r.db.Model(&models.VersionDecompileTask{}).Where("app_id = ? AND number = ? AND id = ?", task.AppID, task.Number, task.ID).Updates(task).Error
}

func (r *WechatRepositoryImpl) RestVersionTaskStatus() error {
	return r.db.Model(&models.VersionDecompileTask{}).Where(" decompile_status  = ? OR match_status  = ?", status.Running, status.Running).
		Updates(map[string]any{
			"decompile_status": status.Waiting,
			"match_status":     status.Waiting,
			"message":          "",
		}).
		Error
}

func (r *WechatRepositoryImpl) AppendVersionTaskByAppID(versions []*models.VersionDecompileTask) error {
	return r.db.Create(versions).Error
}

func (r *WechatRepositoryImpl) FindTaskByAppId(appid string) (*models.MiniAppDecompileTask, error) {
	result := &models.MiniAppDecompileTask{}
	if err := r.db.Model(&models.MiniAppDecompileTask{}).Where("app_id = ?", appid).Preload("Versions").First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *WechatRepositoryImpl) DeleteAllVersionDecompileTask() error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		//if err := tx.Where("1 = 1").Delete(&models.MiniAppDecompileTask{}).Error; err != nil {
		//	return err
		//}
		if err := tx.Where("1 = 1").Delete(&models.VersionDecompileTask{}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *WechatRepositoryImpl) CreateInfo(info *models.Info) error {
	return r.db.Create(info).Error
}

func (r *WechatRepositoryImpl) UpdateInfo(info *models.Info) error {
	return r.db.Model(&models.Info{}).Where("app_id = ?", info.AppID).Updates(info).Error
}

func (r *WechatRepositoryImpl) FindInfoByAppID(appid string) (*models.Info, error) {
	result := &models.Info{}
	if err := r.db.Model(&models.Info{}).Where("app_id = ?", appid).First(result).Error; err != nil {
		return result, err
	}
	return result, nil
}

func (r *WechatRepositoryImpl) DeleteAllInfo() error {
	return r.db.Where("1 = 1").Delete(&models.Info{}).Error
}

func NewWechatRepository(db *gorm.DB) WechatRepository {
	return &WechatRepositoryImpl{db: db}
}
