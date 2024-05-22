package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"fine/backend/service/model/wechat"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"strings"
)

type WechatDBService struct {
	dbConn *gorm.DB
}

func NewWechatDBService() *WechatDBService {
	return &WechatDBService{dbConn: db.GetDBConnect()}
}

func (r *WechatDBService) Insert(miniProgram wechat.MiniProgram) error {
	item := &model.MiniProgram{
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

func (r *WechatDBService) FindByAppId(appid string) model.MiniProgram {
	result := model.MiniProgram{}
	//没处理错误
	r.dbConn.Model(&model.MiniProgram{}).Where("app_id = ?", appid).Preload("Versions").First(&result)
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
	return r.dbConn.Select(clause.Associations).Where("1 = 1").Delete(&model.MiniProgram{}).Error
}

func (r *WechatDBService) InsertMatchStringTask(item model.MatchedString) (uint, error) {
	result := r.dbConn.Create(&item)
	if result.Error != nil {
		return 0, result.Error
	}
	return item.ID, nil
}

func (r *WechatDBService) FindMatchedString(appid string, version int64) model.MatchedString {
	result := model.MatchedString{}
	//没处理错误
	r.dbConn.Model(&model.MatchedString{}).Where("app_id = ? AND version = ?", appid, version).First(&result)
	return result
}

func (r *WechatDBService) UpdateMatchStringTask(id int64, taskDown bool, matched []string) error {
	result := model.MatchedString{}
	if err := r.dbConn.Model(&model.MiniProgram{}).Where("id = ?", id).First(&result).Error; err != nil {
		return err
	}
	result.TaskDown = taskDown
	result.Matched = strings.Join(matched, "")
	return r.dbConn.Model(&result).Updates(&result).Error
}
