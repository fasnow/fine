package repository

import (
	"fine/backend/constant/status"
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type WechatRepository interface {
	CreateTask(task *models.MiniProgramDecompileTask) error
	FindInfoByAppID(appid string) (*models.Info, error)
	DeleteAllInfo() error
	CreateInfo(info *models.Info) error
	UpdateInfo(info *models.Info) error
	AppendVersionByAppID(appid string, versions []*models.VersionDecompileTask) error
	FindByAppId(appid string) (*models.MiniProgramDecompileTask, error)
	DeleteAllVersionDecompileTask() error
	FindVersionByAppIDAndVersionNum(appid, versionNum string) (*models.VersionDecompileTask, error)
	UpdateVersion(version *models.VersionDecompileTask) error
	RestVersionStatus() error
}

type WechatRepositoryImpl struct {
	db *gorm.DB
}

func (r *WechatRepositoryImpl) FindVersionByAppIDAndVersionNum(appid, versionNum string) (*models.VersionDecompileTask, error) {
	result := &models.VersionDecompileTask{}
	if err := r.db.Model(&models.VersionDecompileTask{}).Where("app_id = ? AND number = ?", appid, versionNum).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *WechatRepositoryImpl) CreateTask(task *models.MiniProgramDecompileTask) error {
	if err := r.db.Model(&models.MiniProgramDecompileTask{}).Create(task).Error; err != nil {
		return err
	}
	return nil
}

func (r *WechatRepositoryImpl) UpdateVersion(version *models.VersionDecompileTask) error {
	return r.db.Model(&models.VersionDecompileTask{}).Where("app_id = ? AND number = ?", version.AppID, version.Number).Updates(version).Error
}

func (r *WechatRepositoryImpl) RestVersionStatus() error {
	return r.db.Model(&models.VersionDecompileTask{}).Where(" decompile_status  = ? OR match_status  = ?", status.Running, status.Running).Update("decompile_status", status.Waiting).Update("match_status", status.Waiting).Error
}

func (r *WechatRepositoryImpl) AppendVersionByAppID(appid string, versions []*models.VersionDecompileTask) error {
	return r.db.Create(versions).Error
}

func (r *WechatRepositoryImpl) FindByAppId(appid string) (*models.MiniProgramDecompileTask, error) {
	result := &models.MiniProgramDecompileTask{}
	if err := r.db.Model(&models.MiniProgramDecompileTask{}).Where("app_id = ?", appid).Preload("Versions").First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *WechatRepositoryImpl) DeleteAllVersionDecompileTask() error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		//if err := tx.Where("1 = 1").Delete(&models.MiniProgramDecompileTask{}).Error; err != nil {
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
