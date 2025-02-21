package database

import (
	"fine/backend/application"
	"fine/backend/database/models"
	"fine/backend/service/model/hunter"
	quakeModel "fine/backend/service/model/quake"
	"fine/backend/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"sync"
)

var (
	db   *gorm.DB
	once sync.Once
)

// GetConnection 返回数据库连接的单例
func GetConnection() *gorm.DB {
	if application.DefaultApp.Config.DatabaseFile == "" {
		panic("please set db dir first")
	}
	if err := utils.CreateFile(application.DefaultApp.Config.DatabaseFile); err != nil {
		panic(err)
	}
	once.Do(func() {
		var err error
		db, err = gorm.Open(sqlite.Open(application.DefaultApp.Config.DatabaseFile), &gorm.Config{})
		if err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.ICP{}, &models.ICPQueryLog{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.ICPTask{}, &models.ICPTaskSlice{}, &models.ItemWithID{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.ExportLog{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.CacheTotal{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.History{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.Fofa{}, &models.FOFAQueryLog{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.Hunter{}, &hunter.Component{}, &models.HunterQueryLog{}, &models.HunterRestToken{}); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(&models.Quake{}, &models.QuakeRealtimeQueryLog{}, &quakeModel.Service{}, &quakeModel.Component{}); err != nil {
			application.DefaultApp.Logger.Info(err)
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
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}
		if err = db.AutoMigrate(
			&models.MiniProgramDecompileTask{},
			&models.VersionDecompileTask{},
			&models.Info{},
		); err != nil {
			application.DefaultApp.Logger.Info(err)
			panic(err)
		}

	})
	return db
}
