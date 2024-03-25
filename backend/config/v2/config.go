package config

import (
	"fine/backend/config"
	"fine/backend/db"
	"fine/backend/logger"
	"fine/backend/proxy"
	"fmt"
	"gopkg.in/ini.v1"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

type Fofa struct {
	Email    string        `ini:"email" json:"email" comment:"向前兼容，可有可无"`
	Token    string        `ini:"token" json:"token"`
	Interval time.Duration `ini:"interval" json:"interval" comment:"接口请求间隔，默认:0.3s"`
}
type Hunter struct {
	Token    string        `ini:"token" json:"token"`
	Interval time.Duration `ini:"interval" json:"interval" comment:"接口请求间隔，默认:1.5s"`
}
type Quake struct {
	Token    string        `ini:"token" json:"token"`
	Interval time.Duration `ini:"interval" json:"interval" comment:"接口请求间隔，默认:1s"`
}
type Zone struct {
	Token    string        `ini:"token" json:"token"`
	Interval time.Duration `ini:"interval" json:"interval" comment:"接口请求间隔，默认:1s"`
}
type Proxy struct {
	Enable bool   `ini:"enable" json:"enable"`
	Type   string `ini:"type" json:"type" comment:"http,socks5"`
	Host   string `ini:"host" json:"host"`
	Port   string `ini:"port" json:"port"`
	User   string `ini:"user" json:"user"`
	Pass   string `ini:"pass" json:"pass"`
}

type Wechat struct {
	Applet string `ini:"applet" json:"applet"`
}

type Httpx struct {
	Path      string `ini:"path" json:"path"`
	Flags     string `ini:"flags" json:"flags" comment:"程序参数（不包括目标输入参数标志）"`
	InputFlag string `ini:"input_flag" json:"input_flag" comment:"目标输入参数标志，input_flag=-l和from_file=true搭配或者input_flag=-u和from_file=false搭配"`
	FromFile  bool   `ini:"from_file" json:"from_file" comment:"是否从文件读取，input_flag=-l和from_file=true搭配或者input_flag=-u和from_file=false搭配"`
}

type Config struct {
	Timeout        time.Duration `ini:"timeout" comment:"全局HTTP超时（不含Httpx），默认:20s"`
	Proxy          Proxy
	Fofa           Fofa
	Hunter         Hunter
	Quake          Quake
	Zone           Zone `ini:"0.zone"`
	Wechat         Wechat
	Httpx          Httpx
	baseDir        string `ini:"-"`
	dataDir        string `ini:"-"`
	filePath       string `ini:"-"`
	dbFilePath     string `ini:"-"`
	wechatDataPath string `ini:"-"`
}

var (
	options = ini.LoadOptions{
		SkipUnrecognizableLines:  true, //跳过无法识别的行
		SpaceBeforeInlineComment: true,
	}
	instance      *Config
	defaultConfig = &Config{
		Timeout: 20 * time.Second,
		Proxy: Proxy{
			Enable: false,
			Type:   "http",
			Host:   "127.0.0.1",
			Port:   "8080",
			User:   "",
			Pass:   "",
		},
		Fofa: Fofa{
			Interval: 300 * time.Millisecond,
		},
		Hunter: Hunter{
			Interval: 1500 * time.Millisecond,
		},
		Quake: Quake{
			Interval: 1000 * time.Millisecond,
		},
		Zone: Zone{
			Interval: 1000 * time.Millisecond,
		},
		Httpx: Httpx{
			Path:      "",
			Flags:     "-sc -cl -title",
			InputFlag: "-l",
			FromFile:  true,
		},
	}
)

func init() {
	baseDir := filepath.Dir(os.Args[0])
	if runtime.GOOS != "windows" {
		baseDir, _ = os.UserHomeDir()
		baseDir = filepath.Join(baseDir, "fine")
	}
	defaultConfig.baseDir = baseDir
	defaultConfig.filePath = filepath.Join(defaultConfig.baseDir, "config.ini")
	defaultConfig.dataDir = filepath.Join(baseDir, "data")
	defaultConfig.dbFilePath = filepath.Join(defaultConfig.dataDir, "data.db")
	defaultConfig.wechatDataPath = filepath.Join(defaultConfig.dataDir, "wechatMiniProgram")
	if err := os.MkdirAll(filepath.Join(baseDir, "bin"), 0750); err != nil {
		return
	}

	//创建最长路径即可
	if err := os.MkdirAll(defaultConfig.wechatDataPath, 0750); err != nil {
		return
	}

	//设置数据库路径
	db.SetDBAbsFilepath(defaultConfig.dbFilePath)

	//读取旧版本的配置文件
	t := filepath.Join(baseDir, "config.yaml")
	deprecatedCfg := &config.Config{}
	bytes, _ := os.ReadFile(t)
	if bytes == nil {
		deprecatedCfg = nil
	} else {
		if err := yaml.Unmarshal(bytes, deprecatedCfg); err != nil {
			deprecatedCfg = nil
		} else {
			defer func(name string) {
				_ = os.Remove(name)
			}(t)
		}
	}

	ini.PrettyFormat = false
	if deprecatedCfg != nil {
		tt := defaultConfig
		tt.Timeout = time.Duration(deprecatedCfg.Timeout) * time.Second
		tt.Proxy.Enable = deprecatedCfg.Proxy.Enable
		tt.Proxy.Type = deprecatedCfg.Proxy.Type
		tt.Proxy.Host = deprecatedCfg.Proxy.Host
		tt.Proxy.Port = deprecatedCfg.Proxy.Port
		tt.Proxy.User = deprecatedCfg.Proxy.User
		tt.Proxy.Pass = deprecatedCfg.Proxy.Pass
		tt.Httpx.Path = deprecatedCfg.Httpx.Path
		tt.Httpx.Flags = deprecatedCfg.Httpx.Flags
		tt.Httpx.InputFlag = deprecatedCfg.Httpx.InputFlag
		tt.Httpx.FromFile = deprecatedCfg.Httpx.FromFile
		tt.Fofa.Email = deprecatedCfg.Auth.Fofa.Email
		tt.Fofa.Token = deprecatedCfg.Auth.Fofa.Key
		tt.Fofa.Interval = time.Duration(deprecatedCfg.Interval.Fofa) * time.Millisecond
		tt.Hunter.Token = deprecatedCfg.Auth.Hunter.Key
		tt.Hunter.Interval = time.Duration(deprecatedCfg.Interval.Hunter) * time.Millisecond
		tt.Zone.Token = deprecatedCfg.Auth.Zone.Key
		tt.Zone.Interval = time.Duration(deprecatedCfg.Interval.Zone) * time.Millisecond
		tt.Quake.Token = deprecatedCfg.Auth.Quake.Key
		tt.Quake.Interval = time.Duration(deprecatedCfg.Interval.Quake) * time.Millisecond
		tt.Wechat.Applet = deprecatedCfg.Wechat.AppletPath
		cfg := ini.Empty(options)
		err := ini.ReflectFrom(cfg, tt)
		if err != nil {
			logger.Info("can't reflect deprecated config struct: " + err.Error())
			os.Exit(0)
		}
		err = cfg.SaveTo(defaultConfig.filePath)
		if err != nil {
			logger.Info("can't save deprecated config to a new one: " + err.Error())
			os.Exit(0)
		}
		instance = tt
	} else {
		if _, err := os.Stat(defaultConfig.filePath); os.IsNotExist(err) {
			logger.Info("config file not found, generating default config file...")
			cfg := ini.Empty(options)
			err := ini.ReflectFrom(cfg, defaultConfig)
			if err != nil {
				logger.Info("can't reflect default config struct: " + err.Error())
				os.Exit(0)
			}
			err = cfg.SaveTo(defaultConfig.filePath)
			if err != nil {
				logger.Info("can't generate default config file: " + err.Error())
				os.Exit(0)
			}
			logger.Info("generate default config file successfully, locate at " + defaultConfig.filePath + ", run with default config")

			//超时
			proxy.GetSingleton().SetTimeout(instance.Timeout)
			logger.Info(fmt.Sprintf("set timeout %fs", proxy.GetSingleton().GetTimeout().Seconds()))

			instance = defaultConfig
			return
		}
		cfg, err := ini.LoadSources(options, defaultConfig.filePath)
		if err != nil {
			logger.Info("can't open config file:" + err.Error())
			os.Exit(0)
		}
		instance = defaultConfig
		err = cfg.MapTo(instance)
		if err != nil {
			logger.Info("can't map to config file:" + err.Error())
			os.Exit(0)
		}
	}

	//代理
	if instance.Proxy.Enable {
		var p string
		if instance.Proxy.User != "" && instance.Proxy.Pass != "" {
			p = fmt.Sprintf("%s://%s:%s@%s:%s", instance.Proxy.Type, instance.Proxy.User, instance.Proxy.Pass, instance.Proxy.Host, instance.Proxy.Port)
		} else {
			p = fmt.Sprintf("%s://%s:%s", instance.Proxy.Type, instance.Proxy.Host, instance.Proxy.Port)
		}
		if err := proxy.GetSingleton().SetProxy(p); err != nil {
			logger.Info("set proxy error: " + err.Error())
		}
		logger.Info("enable proxy on" + proxy.GetSingleton().ProxyString())
	}

	//超时
	proxy.GetSingleton().SetTimeout(instance.Timeout)
	logger.Info(fmt.Sprintf("set timeout %fs", proxy.GetSingleton().GetTimeout().Seconds()))
}

func GetSingleton() *Config {
	return instance
}

func save(config Config) error {
	cfg := ini.Empty(options)
	err := ini.ReflectFrom(cfg, &config)
	if err != nil {
		logger.Info("can't reflect default config struct: " + err.Error())
		return err
	}
	err = cfg.SaveTo(config.filePath)
	if err != nil {
		logger.Info("can't generate default config file: " + err.Error())
		return err
	}
	*instance = config
	return nil
}

func GetProxy() Proxy {
	return instance.Proxy
}

func SaveProxy(p Proxy) error {
	t := instance
	t.Proxy = p
	err := save(*t)
	if err != nil {
		logger.Info("can't save proxy to file")
		return err
	}
	if p.Enable {
		if p.User != "" {
			auth := p.User
			if p.Pass != "" {
				auth += ":" + p.Pass + "@"
				_ = proxy.GetSingleton().SetProxy(fmt.Sprintf("%s://%s%s:%s", p.Type, auth, p.Host, p.Port))
				logger.Info("proxy enabled on " + proxy.GetSingleton().ProxyString())
				return nil
			}
		}
		_ = proxy.GetSingleton().SetProxy(fmt.Sprintf("%s://%s:%s", p.Type, p.Host, p.Port))
		logger.Info("proxy enabled on " + proxy.GetSingleton().ProxyString())
		return nil
	}
	_ = proxy.GetSingleton().SetProxy("")
	logger.Info("proxy disabled")
	return nil
}

func GetFofa() Fofa {
	return instance.Fofa
}

func GetBaseDir() string {
	return instance.baseDir
}

func SaveWechatDataPath(path string) {
	instance.wechatDataPath = path
}

func GetWechatDataPath() string {
	return instance.wechatDataPath
}

func GetDataDir() string {
	return instance.dataDir
}

func SaveFofa(fofa Fofa) error {
	t := instance
	t.Fofa = fofa
	err := save(*t)
	if err != nil {
		logger.Info("can't save fofa to file")
		return err
	}
	return nil
}

func GetHunter() Hunter {
	return instance.Hunter
}

func SaveHunter(hunter Hunter) error {
	t := instance
	t.Hunter = hunter
	err := save(*t)
	if err != nil {
		logger.Info("can't save hunter to file")
		return err
	}
	return nil
}

func GetQuake() Quake {
	return instance.Quake
}

func SaveQuake(quake Quake) error {
	t := instance
	t.Quake = quake
	err := save(*t)
	if err != nil {
		logger.Info("can't save quake to file")
		return err
	}
	return nil
}

func Get0zone() Zone {
	return instance.Zone
}

func Save0zone(zone Zone) error {
	t := instance
	t.Zone = zone
	err := save(*t)
	if err != nil {
		logger.Info("can't save 0.zone to file")
		return err
	}
	return nil
}

func GetDBFile() string {
	return instance.dbFilePath
}

func GetConfigFilePath() string {
	return instance.filePath
}

func GetHttpx() Httpx {
	return instance.Httpx
}

func SaveHttpx(httpx Httpx) error {
	t := instance
	t.Httpx = httpx
	err := save(*t)
	if err != nil {
		logger.Info("can't save httpx to file")
		return err
	}
	return nil
}

func GetWechat() Wechat {
	return instance.Wechat
}

func SaveWechat(wechat Wechat) error {
	t := instance
	t.Wechat = wechat
	err := save(*t)
	if err != nil {
		logger.Info("can't save wechat to file")
		return err
	}
	return nil
}
