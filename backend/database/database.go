package database

import (
	"fine/backend/config"
	"fine/backend/database/models"
	"fine/backend/logger"
	"fine/backend/service/model/hunter"
	quakeModel "fine/backend/service/model/quake"
	"fine/backend/service/model/wechat"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"sync"
)

var (
	db     *gorm.DB
	once   sync.Once
	dbFile string
)

func init() {
	dbFile = config.GlobalConfig.DatabaseFile
}

// GetConnection 返回数据库连接的单例
func GetConnection() *gorm.DB {
	if dbFile == "" {
		panic("please set db dir first")
	}
	once.Do(func() {
		var err error
		db, err = gorm.Open(sqlite.Open(dbFile), &gorm.Config{})
		if err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.ICP{}, &models.ICPQueryLog{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.DownloadLog{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.CacheTotal{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.History{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.Fofa{}, &models.FOFAQueryLog{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.Hunter{}, &hunter.Component{}, &models.HunterQueryLog{}, &models.HunterRestToken{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(&models.Quake{}, &models.QuakeRealtimeQueryLog{}, &quakeModel.Service{}, &quakeModel.Component{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(
			&models.ZoneSite{},
			&models.ZoneDomain{},
			//&model.ZoneApk{},
			&models.ZoneMember{},
			&models.ZoneEmail{},
			//&model.ZoneCode{},
			//&model.ZoneDwm{},
			//&model.ZoneAim{},
			&models.ZoneQueryLog{},
		); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = db.AutoMigrate(
			&models.MiniProgram{},
			&wechat.Version{},
			&models.MatchedString{},
			&models.Info{},
		); err != nil {
			logger.Info(err.Error())
			panic(err)
		}

	})
	return db
}
