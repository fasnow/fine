package db

import (
	"fine/backend/db/models"
	"fine/backend/logger"
	"fine/backend/service/model/hunter"
	quakeModel "fine/backend/service/model/quake"
	"fine/backend/service/model/wechat"
	"github.com/yitter/idgenerator-go/idgen"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"sync"
)

var (
	dbConn        *gorm.DB
	once          sync.Once
	dbAbsFilePath string
)

func init() {
	// 创建 IdGeneratorOptions 对象，可在构造函数中输入 WorkerId：
	var options = idgen.NewIdGeneratorOptions(1)
	// options.WorkerIdBitLength = 10  // 默认值6，限定 WorkerId 最大值为2^6-1，即默认最多支持64个节点。
	// options.SeqBitLength = 6; // 默认值6，限制每毫秒生成的ID个数。若生成速度超过5万个/秒，建议加大 SeqBitLength 到 10。
	// options.BaseTime = Your_Base_Time // 如果要兼容老系统的雪花算法，此处应设置为老系统的BaseTime。
	// ...... 其它参数参考 IdGeneratorOptions 定义。
	// 保存参数（务必调用，否则参数设置不生效）：
	idgen.SetIdGenerator(options)
}

// GetDBConnect 返回 MySQL 数据库连接的单例
func GetDBConnect() *gorm.DB {
	if dbAbsFilePath == "" {
		panic("please set db dir first")
	}
	once.Do(func() {
		var err error
		dbConn, err = gorm.Open(sqlite.Open(dbAbsFilePath), &gorm.Config{})
		if err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(&models.ICP{}, &models.ICPQueryLog{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(&models.DownloadLog{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(&models.CacheTotal{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(&models.Fofa{}, &models.FOFAQueryLog{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(&models.Hunter{}, &hunter.Component{}, &models.HunterQueryLog{}, &models.HunterRestToken{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(&models.Quake{}, &models.QuakeRealtimeQueryLog{}, &quakeModel.Service{}, &quakeModel.Component{}); err != nil {
			logger.Info(err.Error())
			panic(err)
		}
		if err = dbConn.AutoMigrate(
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
		if err = dbConn.AutoMigrate(
			&models.MiniProgram{},
			&wechat.Version{},
			&models.MatchedString{},
			&models.Info{},
		); err != nil {
			logger.Info(err.Error())
			panic(err)
		}

	})
	return dbConn
}

func SetDBAbsFilepath(filepath string) {
	dbAbsFilePath = filepath
}
