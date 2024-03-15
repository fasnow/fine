package config

import (
	"fine/backend/db"
	"fmt"
	"github.com/fasnow/ghttp"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
	"runtime"
	"sync"
)

const (
	FofaName       = "Fofa"
	HunterName     = "Hunter"
	QuakeName      = "Quake"
	ZoneName       = "0.zone"
	defaultTimeout = 15 //second
)

var (
	baseDir        string
	dataDir        string
	cfgAbsFilePath string
	dbAbsFilePath  string

	once          sync.Once
	cfgInstance   Config
	defaultConfig = Config{
		Timeout: defaultTimeout,
		Interval: Interval{
			Fofa:   300, //实际限制速率不是这个值
			Hunter: 1500,
			Quake:  1000,
			Zone:   1000,
		},
		Proxy: Proxy{
			Enable: false,
			Type:   "http",
			Host:   "127.0.0.1",
			Port:   "8080",
			User:   "",
			Pass:   "",
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
	cfgInstance = Config{}
	baseDir = filepath.Dir(os.Args[0])
	if runtime.GOOS != "windows" {
		baseDir, _ = os.UserHomeDir()
		baseDir = filepath.Join(baseDir, "fine")
	}
	dataDir = filepath.Join(baseDir, "data")
	cfgAbsFilePath = filepath.Join(baseDir, "config.yaml")
	dbAbsFilePath = filepath.Join(dataDir, "data.db")
	if err := cfgInstance.ifDirNonExistThenCreat(baseDir); err != nil {
		return
	}
	if err := cfgInstance.ifDirNonExistThenCreat(dataDir); err != nil {
		fmt.Println(err)
		return
	}
	if err := cfgInstance.ifDirNonExistThenCreat(filepath.Join(dataDir, "wechatMiniProgram")); err != nil {
		return
	}
	if err := cfgInstance.ifDirNonExistThenCreat(filepath.Join(baseDir, "bin")); err != nil {
		return
	}
	config, err := cfgInstance.GetConfigFromFile()
	if err != nil {
		return
	}
	cfgInstance = *config
	cfgInstance.Wechat.DataCachePath = filepath.Join(dataDir, "wechatMiniProgram")
	if err != nil {
		fmt.Println(err)
		return
	}
	db.SetDBAbsFilepath(dbAbsFilePath)
}

func GetSingleton() *Config {
	//once.Do(func() {
	//	cfgInstance = Config{}
	//	baseDir = filepath.Dir(os.Args[0])
	//	if runtime.GOOS != "windows" {
	//		baseDir, _ = os.UserHomeDir()
	//		baseDir = filepath.Join(baseDir, "fine")
	//	}
	//	dataDir = filepath.Join(baseDir, "data")
	//	cfgAbsFilePath = filepath.Join(baseDir, "config.yaml")
	//	dbAbsFilePath = filepath.Join(dataDir, "data.db")
	//	if err := cfgInstance.ifDirNonExistThenCreat(baseDir); err != nil {
	//		return
	//	}
	//	if err := cfgInstance.ifDirNonExistThenCreat(dataDir); err != nil {
	//		fmt.Println(err)
	//		return
	//	}
	//	if err := cfgInstance.ifDirNonExistThenCreat(filepath.Join(dataDir, "wechatMiniProgram")); err != nil {
	//		return
	//	}
	//	if err := cfgInstance.ifDirNonExistThenCreat(filepath.Join(baseDir, "bin")); err != nil {
	//		return
	//	}
	//	config, err := cfgInstance.GetConfigFromFile()
	//	if err != nil {
	//		return
	//	}
	//	cfgInstance = *config
	//	cfgInstance.wechat.DataCachePath = filepath.Join(dataDir, "wechatMiniProgram")
	//	if err != nil {
	//		fmt.Println(err)
	//		return
	//	}
	//	db.SetDBAbsFilepath(dbAbsFilePath)
	//})
	return &cfgInstance
}

type Config struct {
	Auth     Auth  `yaml:"auth" json:"auth"`
	Proxy    Proxy `yaml:"proxy" json:"proxy"`
	Interval `yaml:"interval" json:"interval"`
	Timeout  int    `yaml:"timeout" json:"timeout"` //秒
	Httpx    Httpx  `yaml:"httpx" json:"httpx"`
	Wechat   Wechat `yaml:"wechat" json:"wechat"`
}

type Httpx struct {
	Path      string `yaml:"path" json:"path"`
	Flags     string `yaml:"flags" json:"flags"`
	InputFlag string `yaml:"inputFlag" json:"inputFlag"`
	FromFile  bool   `yaml:"fromFile" json:"fromFile"`
}

type (
	Auth struct {
		Fofa   Fofa   `yaml:"fofa" json:"fofa" `
		Hunter Hunter `yaml:"hunter" json:"hunter"`
		Quake  Quake  `yaml:"quake" json:"quake"`
		Zone   Zone   `yaml:"0.zone" json:"0.zone"`
	}
	Fofa struct {
		Key   string `yaml:"key" json:"key"`
		Email string `yaml:"email" json:"email"`
	}
	Hunter struct {
		Key string `yaml:"key" json:"key"`
	}
	Quake struct {
		Key string `yaml:"key" json:"key"`
	}
	Zone struct {
		Key string `yaml:"key" json:"key"`
	}
	Proxy struct {
		Enable bool   `yaml:"enable" json:"enable"`
		Type   string `yaml:"type" json:"type"` // http,socks5
		Host   string `yaml:"host" json:"host"`
		Port   string `yaml:"port" json:"port"`
		User   string `yaml:"user" json:"user"`
		Pass   string `yaml:"pass" json:"pass"`
	}
)

type Interval struct {
	//毫秒
	Fofa   int `yaml:"fofa" json:"fofa" `
	Hunter int `yaml:"hunter" json:"hunter"`
	Quake  int `yaml:"quake" json:"quake"`
	Zone   int `yaml:"0.zone" json:"0.zone"`
}

type Wechat struct {
	AppletPath    string `yaml:"appletPath" json:"appletPath"`
	DataCachePath string `json:"dataCachePath"`
}

// GetDefaultTimeout second
func (c *Config) GetDefaultTimeout() int {
	return defaultTimeout
}

func (c *Config) GetDefaultInterval() Interval {
	return defaultConfig.Interval
}

func GetDefaultTimeout() int {
	return defaultTimeout
}

func GetDefaultInterval() Interval {
	return defaultConfig.Interval
}

func (c *Config) GetConfigBaseDir() string {
	return baseDir
}

func (c *Config) GetDataBaseDir() string {
	return dataDir
}

func GetBaseDataDir() string {
	return dataDir
}

func (c *Config) GetAll() Config {
	return cfgInstance
}

func (c *Config) SaveConf(conf Config) (err error) {
	marshal, err := yaml.Marshal(conf)
	if err != nil {
		return err
	}
	if err = os.WriteFile(cfgAbsFilePath, marshal, 0666); err != nil {
		return err
	}
	cfgInstance = conf
	return nil
}

func (c *Config) ifDirNonExistThenCreat(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *Config) GetConfigFromFile() (*Config, error) {
	_, err := os.Stat(cfgAbsFilePath)
	if os.IsNotExist(err) {
		if runtime.GOOS == "windows" {
			defaultConfig.Httpx.Path = filepath.Join(c.GetConfigBaseDir(), "bin", "httpx.exe")
		} else {
			defaultConfig.Httpx.Path = filepath.Join(c.GetConfigBaseDir(), "bin", "httpx")
		}
		if err := c.SaveConf(defaultConfig); err != nil {
			return nil, err
		}
		cfgInstance = defaultConfig
		return &cfgInstance, nil
	} else if err != nil {
		return nil, err
	}

	file, err := os.Open(cfgAbsFilePath)
	defer file.Close()
	if err != nil {
		return nil, err
	}

	fileInfo, err := file.Stat() //获取文件属性
	if err != nil {
		return nil, err
	}

	fileSize := fileInfo.Size() //文件大小
	if fileSize == 0 {
		if runtime.GOOS == "windows" {
			defaultConfig.Httpx.Path = filepath.Join(c.GetConfigBaseDir(), "bin", "httpx.exe")
		} else {
			defaultConfig.Httpx.Path = filepath.Join(c.GetConfigBaseDir(), "bin", "httpx")
		}
		if err := c.SaveConf(defaultConfig); err != nil {
			return nil, err
		}
		cfgInstance = defaultConfig
		return &cfgInstance, nil
	}
	buffer := make([]byte, fileSize)

	if _, err = file.Read(buffer); err != nil { //读文件
		return nil, err
	}

	var config = &Config{}
	if err = yaml.Unmarshal(buffer, config); err != nil { //一定要加这个判断，或者调用者不做错误处理
		return nil, err
	}
	cfgInstance = *config
	return &cfgInstance, nil
}

func (c *Config) GetProxy() Proxy {
	if cfgInstance.Proxy.Host == "" {
		c.Proxy = defaultConfig.Proxy
		_ = c.SaveConf(*c)
		return cfgInstance.Proxy
	}
	return cfgInstance.Proxy
}

func (c *Config) SaveProxy(proxy Proxy) error {
	c.Proxy = proxy
	if err := c.SaveConf(*c); err != nil {
		return err
	}

	if proxy.Enable {
		auth := ""
		if proxy.User != "" {
			auth = proxy.User
			if proxy.Pass != "" {
				auth += ":" + proxy.Pass
			}
		}
		_ = ghttp.SetGlobalProxy(fmt.Sprintf("%s://%s%s:%s", proxy.Type, auth, proxy.Host, proxy.Port))
	} else {
		_ = ghttp.SetGlobalProxy("")
	}

	return nil
}

func (c *Config) GetFofaAuth() Fofa {
	return cfgInstance.Auth.Fofa
}

func (c *Config) SaveFofaAuth(email, key string) error {
	c.Auth.Fofa = Fofa{
		Key:   key,
		Email: email,
	}
	if err := c.SaveConf(*c); err != nil {
		return err
	}
	return nil
}

func (c *Config) GetHunterAuth() Hunter {
	return cfgInstance.Auth.Hunter
}

func (c *Config) SaveHunterAuth(key string) error {
	c.Auth.Hunter = Hunter{Key: key}
	if err := c.SaveConf(*c); err != nil {
		return err
	}
	return nil
}

func (c *Config) GetQuakeAuth() Quake {
	return cfgInstance.Auth.Quake
}

func (c *Config) SaveQuakeAuth(key string) error {
	c.Auth.Quake = Quake{Key: key}
	if err := c.SaveConf(*c); err != nil {
		return err
	}
	return nil
}

func (c *Config) Get0zoneAuth() Zone {
	return cfgInstance.Auth.Zone
}

func (c *Config) Save0zoneAuth(key string) error {
	c.Auth.Zone = Zone{Key: key}
	if err := c.SaveConf(*c); err != nil {
		return err
	}
	return nil
}

func (c *Config) CheckAuth(name string) bool {
	switch name {
	case FofaName:
		return cfgInstance.Auth.Fofa.Key != ""
	case HunterName:
		return cfgInstance.Auth.Hunter.Key != ""
	case QuakeName:
		return cfgInstance.Auth.Quake.Key != ""
	case ZoneName:
		return cfgInstance.Auth.Zone.Key != ""
	default:
		return false
	}
}

func (c *Config) GetDBFile() string {
	return dbAbsFilePath
}

func (c *Config) GetConfigAbsFilePath() string {
	return cfgAbsFilePath
}

func (c *Config) GetHttpx() Httpx {
	if cfgInstance.Httpx.Flags == "" {
		c.Httpx = defaultConfig.Httpx
		_ = c.SaveConf(*c)
		return cfgInstance.Httpx
	}
	return cfgInstance.Httpx
}

func (c *Config) SaveHttpx(httpx Httpx) error {
	c.Httpx = httpx
	if err := c.SaveConf(*c); err != nil {
		return err
	}
	return nil
}

func (c *Config) GetWechat() Wechat {
	if cfgInstance.Wechat.AppletPath == "" {
		c.Wechat.AppletPath = ""
		_ = c.SaveConf(*c)
		return cfgInstance.Wechat
	}
	return cfgInstance.Wechat
}

func (c *Config) SaveWechat(wechat Wechat) error {
	c.Wechat = wechat
	if err := c.SaveConf(*c); err != nil {
		return err
	}
	return nil
}
