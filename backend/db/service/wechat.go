package service

import (
	"fine/backend/db"
	"gorm.io/gorm"
)

type WechatDBService struct {
	dbConn *gorm.DB
}

func NewWechatDBService() *WechatDBService {
	return &WechatDBService{dbConn: db.GetDBConnect()}
}

func (r *WechatDBService) InsertDecryption() {

}
