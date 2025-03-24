package database

import (
	"fine/backend/database/models"
	shodan2 "fine/backend/database/models/shodan"
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

var databaseFile = ""

func SetDatabaseFile(filepath string) {
	databaseFile = filepath
}

// GetConnection 返回数据库连接的单例
func GetConnection() *gorm.DB {
	if databaseFile == "" {
		panic("please set db file first")
	}
	if err := utils.CreateFile(databaseFile); err != nil {
		panic(err)
	}
	once.Do(func() {
		var err error
		db, err = gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})
		if err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.ICP{}, &models.ICPQueryLog{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.ICPTask{}, &models.ICPTaskSlice{}, &models.ItemWithID{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.ExportLog{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.CacheTotal{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.History{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.Fofa{}, &models.FOFAQueryLog{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.Hunter{}, &hunter.Component{}, &models.HunterQueryLog{}, &models.HunterUser{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&models.Quake{}, &models.QuakeRealtimeQueryLog{}, &quakeModel.Service{}, &quakeModel.Component{}); err != nil {
			panic(err)
		}
		if err = db.AutoMigrate(&shodan2.QueryLog{}, &shodan2.HostSearchResult{}); err != nil {
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
			panic(err)
		}
		if err = db.AutoMigrate(
			&models.MiniAppDecompileTask{},
			&models.VersionDecompileTask{},
			&models.Info{},
		); err != nil {
			panic(err)
		}

		if err = db.AutoMigrate(
			&models.ProxyHistory{},
		); err != nil {
			panic(err)
		}

	})
	return db
}
