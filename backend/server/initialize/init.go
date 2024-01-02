package initialize

import (
	config2 "fine-server/config"
	"fine-server/sdk/fofa"
	"fine-server/sdk/hunter"
	"fine-server/sdk/icp"
	"fine-server/sdk/quake"
	"fine-server/sdk/tianyancha"
	"fine-server/sdk/zone"
	"fine-server/utils"
	"fmt"
	"github.com/fasnow/ghttp"
	"strings"
	"sync"
	"time"
)

var baseDir string
var cfg config2.Config

var (
	FofaClient          *fofa.Fofa
	HunterClient        *hunter.Hunter
	ZoneClient          *zone.Zone
	QuakeClient         *quake.Quake
	IcpRecordClient     *icp.ICP
	TianYanChaClient    *tianyancha.TianYanCha
	QueryCache          *utils.Cache
	DefaultCacheTimeout = 3 * time.Hour
)

func GetConfig() config2.Config {
	return cfg
}

func Init(dataPath string) error {
	baseDir = dataPath
	err := config2.SetBaseDir(baseDir)
	if err != nil {
		return err
	}
	cfg = config2.GetConfig()
	config()
	cache()
	httpClient()
	return nil
}

func cache() {
	QueryCache = utils.NewCache()
}

func httpClient() {
	FofaClient = fofa.NewClient(cfg.Auth.Fofa.Email, cfg.Auth.Fofa.Key)
	HunterClient = hunter.NewClient(cfg.Auth.Hunter.Key)
	ZoneClient = zone.NewClient(cfg.Auth.Zone.Key)
	IcpRecordClient = icp.NewClient()
	QuakeClient = quake.NewClient(cfg.Auth.Quake.Key)
	TianYanChaClient = tianyancha.NewClient()
}

func config() {
	// 超时,s
	if cfg.Timeout <= 0 {
		cfg.Timeout = config2.GetDefaultTimeout()
	}

	// 全局默认超时
	ghttp.SetGlobalTimeout(time.Duration(cfg.Timeout) * time.Second)

	var interval = config2.GetDefaultInterval()

	// 导出时的查询间隔,ms
	if cfg.Interval.Hunter <= 0 {
		cfg.Interval.Hunter = interval.Hunter
	}
	if cfg.Interval.Fofa <= 0 {
		cfg.Interval.Fofa = interval.Fofa
	}
	if cfg.Interval.Quake <= 0 {
		cfg.Interval.Quake = interval.Quake
	}
	if cfg.Interval.Zone <= 0 {
		cfg.Interval.Zone = interval.Zone
	}

	// 全局代理
	if cfg.Proxy.Host != "" && strings.TrimSpace(cfg.Proxy.Port) != "" && cfg.Proxy.Enable {
		if cfg.Proxy.User != "" {
			err := ghttp.SetGlobalProxy(fmt.Sprintf("%v://%v:%v@%v:%v", cfg.Proxy.Type, cfg.Proxy.User, cfg.Proxy.Pass, cfg.Proxy.Host, cfg.Proxy.Port))
			if err != nil {
				return
			}
		} else {
			err := ghttp.SetGlobalProxy(fmt.Sprintf("%v://%v:%v", cfg.Proxy.Type, cfg.Proxy.Host, cfg.Proxy.Port))
			if err != nil {
				return
			}
		}
	}
}

func ReInit() {
	//设计的不好
	var m = &sync.Mutex{}
	m.Lock()
	cfg = config2.GetConfig()
	config()
	httpClient()
	m.Unlock()
}
