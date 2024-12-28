package repository

import (
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/service/model/wechat"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"strings"
)

type WechatDBService struct {
	dbConn *gorm.DB
}

func NewWechatDBService() *WechatDBService {
	return &WechatDBService{dbConn: database.GetConnection()}
}

func (r *WechatDBService) Insert(miniProgram wechat.MiniProgram) error {
	item := &models.MiniProgram{
		MiniProgram: wechat.MiniProgram{
			AppID:    miniProgram.AppID,
			Versions: miniProgram.Versions,
		},
	}
	return r.dbConn.Create(item).Error
}

func (r *WechatDBService) AppendVersionByAppID(appid string, version ...wechat.Version) error {
	item := r.FindByAppId(appid)
	if item.AppID != "" {
		item.Versions = append(item.Versions, version...)
	}
	return r.dbConn.Session(&gorm.Session{FullSaveAssociations: true}).Updates(&item).Error
}

func (r *WechatDBService) FindByAppId(appid string) models.MiniProgram {
	result := models.MiniProgram{}
	r.dbConn.Model(&models.MiniProgram{}).Where("app_id = ?", appid).Preload("Versions").Limit(1).Find(&result)
	return result
}

func (r *WechatDBService) UpdateUnpackedStatus(appid, version string, unpacked bool) error {
	item := r.FindByAppId(appid)
	for i := 0; i < len(item.Versions); i++ {
		if item.Versions[i].Number == version {
			item.Versions[i].Unpacked = unpacked
		}
	}
	if item.AppID != "" {
		return r.dbConn.Session(&gorm.Session{FullSaveAssociations: true}).Updates(&item).Error
	}
	return nil
}

func (r *WechatDBService) DeleteAll() error {
	return r.dbConn.Select(clause.Associations).Where("1 = 1").Delete(&models.MiniProgram{}).Error
}

func (r *WechatDBService) InsertMatchStringTask(item models.MatchedString) (uint, error) {
	result := r.dbConn.Create(&item)
	if result.Error != nil {
		return 0, result.Error
	}
	return item.ID, nil
}

func (r *WechatDBService) FindMatchedString(appid, version string) models.MatchedString {
	result := models.MatchedString{}
	r.dbConn.Model(&models.MatchedString{}).Where("app_id = ? AND version = ?", appid, version).Limit(1).Order("id desc").Find(&result)
	return result
}

func (r *WechatDBService) UpdateMatchStringTask(id uint, taskDown bool, matched []string) error {
	result := models.MatchedString{}
	result.TaskDown = taskDown
	result.Matched = strings.Join(matched, "\n")
	return r.dbConn.Model(&result).Where("id = ?", id).Updates(&result).Error
}

func (r *WechatDBService) InsertInfo(info models.Info) error {
	result := &models.Info{}
	r.dbConn.Model(&models.Info{}).Where("app_id = ?", info.AppID).Limit(1).Find(result)
	if result.ID != 0 {
		result.Info = info.Info
		r.dbConn.Updates(result)
		return nil
	}
	return r.dbConn.Create(&info).Error
}

func (r *WechatDBService) FindInfoByAppID(appid string) (models.Info, error) {
	result := models.Info{}
	if err := r.dbConn.Model(&models.Info{}).Where("app_id = ?", appid).Limit(1).Find(&result).Error; err != nil {
		return result, err
	}
	return result, nil
}

func (r *WechatDBService) DeleteAllInfo() error {
	return r.dbConn.Where("1 = 1").Delete(&models.Info{}).Error
}
