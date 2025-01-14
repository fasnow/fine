package config

import (
	"fine/backend/logger"
	"fine/backend/proxy/v2"
	"fmt"
	"gopkg.in/ini.v1"
	"gorm.io/gorm"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

type Fofa struct {
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
	Applet string   `ini:"applet" json:"applet"`
	Rules  []string `ini:"rule,,allowshadow" json:"rules" `
}

type Httpx struct {
	Path  string `ini:"path" json:"path"`
	Flags string `ini:"flags" json:"flags" comment:"程序参数（不包括目标输入参数标志）"`
}

type DNS struct {
	Value []string `ini:"value,,allowshadow" json:"value"`
}

type QueryOnEnter struct {
	Assets bool `ini:"assets" json:"assets"`
	ICP    bool `ini:"icp" json:"icp"`
	IP138  bool `ini:"ip138" json:"ip138"`
}

type TianYanCha struct {
	Token string `ini:"token" json:"token" comment:"X-AUTH-TOKEN"`
}

type AiQiCha struct {
	Cookie string `ini:"cookie" json:"cookie" comment:"cookie"`
}

type ICP struct {
	Proxy    string        `ini:"proxy" json:"proxy" comment:"ICP代理,优先级高于全局"`
	Interval time.Duration `ini:"interval" json:"interval"`
}

type Config struct {
	Timeout        time.Duration `ini:"timeout" json:"timeout" comment:"全局HTTP超时（不含Httpx），默认:20s"`
	Proxy          Proxy
	Fofa           Fofa
	Hunter         Hunter
	Quake          Quake
	Zone           Zone `ini:"0.zone"`
	ICP            ICP
	TianYanCha     TianYanCha
	AiQiCha        AiQiCha
	Wechat         Wechat
	Httpx          Httpx
	DNS            DNS    `comment:"获取IP和判断CDN时会用到"`
	BaseDir        string `ini:"-"`
	DataDir        string `ini:"-"`
	filePath       string `ini:"-"`
	DatabaseFile   string `ini:"-"`
	WechatDataPath string `ini:"-"`
	QueryOnEnter   QueryOnEnter
}

var (
	options = ini.LoadOptions{
		SkipUnrecognizableLines:  true, //跳过无法识别的行
		SpaceBeforeInlineComment: true,
		AllowShadows:             true,
	}
	ProxyManager  = proxy.NewManager()
	DB            *gorm.DB
	GlobalConfig  *Config
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
		ICP: ICP{
			Interval: 1000 * time.Millisecond,
		},
		TianYanCha: TianYanCha{Token: ""},
		AiQiCha:    AiQiCha{Cookie: ""},
		Httpx: Httpx{
			Path:  "",
			Flags: "-sc -cl -title",
		},
		DNS: DNS{Value: []string{"223.5.5.5"}}, //AliDNS
		Wechat: Wechat{Rules: []string{
			"baseUrl: \".*?\"",
			"server: \".*?\"",
			"http(s)://.*?[/\\,\"\\s\\n]",
			"post\\(\".*?\"\\)",
			"get\\(\".*?\"\\)",
			"url: \".*?\"",
			"secret: \".*?\"",
			"accessToken: \".*?\"",
			"appid: \".*?\"",
			"appsecret: \".*?\"",
		}},
	}
)

func init() {
	baseDir := filepath.Dir(os.Args[0])
	if runtime.GOOS != "windows" {
		baseDir, _ = os.UserHomeDir()
		baseDir = filepath.Join(baseDir, "fine")
	}
	defaultConfig.BaseDir = baseDir
	defaultConfig.filePath = filepath.Join(defaultConfig.BaseDir, "config.ini")
	defaultConfig.DataDir = filepath.Join(baseDir, "data")
	defaultConfig.DatabaseFile = filepath.Join(defaultConfig.DataDir, "data.db")
	defaultConfig.WechatDataPath = filepath.Join(defaultConfig.DataDir, "wechatMiniProgram")

	logger.DataDir = filepath.Join(baseDir, "log")

	if err := os.MkdirAll(filepath.Join(baseDir, "bin"), 0750); err != nil {
		logger.Info(err)
		return
	}

	//创建最长路径即可
	if err := os.MkdirAll(defaultConfig.WechatDataPath, 0750); err != nil {
		logger.Info(err)
		return
	}

	GlobalConfig = defaultConfig
	ini.PrettyFormat = false
	if _, err := os.Stat(defaultConfig.filePath); os.IsNotExist(err) {
		logger.Info("config file not found, generating default config file...")
		cfg := ini.Empty(options)
		if runtime.GOOS != "windows" {
			homeDir, err := os.UserHomeDir()
			if err != nil {
				logger.Info(err)
				os.Exit(1)
			}
			defaultConfig.Wechat.Applet = filepath.Join(homeDir, "Library/Containers/com.tencent.xinWeChat/Data/.wxapplet/packages")
		}
		err := ini.ReflectFrom(cfg, defaultConfig)
		if err != nil {
			logger.Info("can't reflect default config struct: " + err.Error())
			os.Exit(2)
		}
		err = cfg.SaveTo(defaultConfig.filePath)
		if err != nil {
			logger.Info("can't generate default config file: " + err.Error())
			os.Exit(3)
		}
		logger.Info("generate default config file successfully, locate at " + defaultConfig.filePath + ", run with default config")

		//超时
		ProxyManager.SetTimeout(GlobalConfig.Timeout)
		logger.Info(fmt.Sprintf("set timeout %fs", ProxyManager.GetClient().Timeout.Seconds()))

		return
	}
	cfg, err := ini.LoadSources(options, defaultConfig.filePath)
	if err != nil {
		logger.Info("can't open config file:" + err.Error())
		os.Exit(4)
	}

	//迭代配置,避免添加额外数据
	if cfg.Section("Wechat").HasKey("rule") {
		GlobalConfig.Wechat.Rules = nil
	}
	if cfg.Section("DNS").HasKey("rule") {
		GlobalConfig.DNS.Value = nil
	}

	err = cfg.MapTo(GlobalConfig)
	if err != nil {
		logger.Info("can't map to config file:" + err.Error())
		os.Exit(5)
	}

	// 对于allowshadow关键字的配置，如果内容包含逗号不能直接映射，需要单独取出后填充
	rules := cfg.Section(`Wechat`).Key("rule").ValueWithShadows()
	GlobalConfig.Wechat.Rules = rules

	if runtime.GOOS != "windows" { // darwin下微信小程序固定目录
		homeDir, err := os.UserHomeDir()
		if err != nil {
			logger.Info(err)
			os.Exit(6)
		}
		GlobalConfig.Wechat.Applet = filepath.Join(homeDir, "Library/Containers/com.tencent.xinWeChat/Data/.wxapplet/packages")
	}

	Save()
	logger.Info(*GlobalConfig)

	//代理
	if GlobalConfig.Proxy.Enable {
		var p string
		if GlobalConfig.Proxy.User != "" && GlobalConfig.Proxy.Pass != "" {
			p = fmt.Sprintf("%s://%s:%s@%s:%s", GlobalConfig.Proxy.Type, GlobalConfig.Proxy.User, GlobalConfig.Proxy.Pass, GlobalConfig.Proxy.Host, GlobalConfig.Proxy.Port)
		} else {
			p = fmt.Sprintf("%s://%s:%s", GlobalConfig.Proxy.Type, GlobalConfig.Proxy.Host, GlobalConfig.Proxy.Port)
		}
		if err := ProxyManager.SetProxy(p); err != nil {
			logger.Info("set proxy error: " + err.Error())
		}
		logger.Info("enable proxy on" + ProxyManager.ProxyString())
	}

	//超时
	ProxyManager.SetTimeout(GlobalConfig.Timeout)
	logger.Info(fmt.Sprintf("set timeout %fs", ProxyManager.GetClient().Timeout.Seconds()))
}

func Save() error {
	cfg := ini.Empty(options)
	err := ini.ReflectFrom(cfg, GlobalConfig)
	if err != nil {
		logger.Info("can't reflect default config struct: " + err.Error())
		return err
	}
	err = cfg.SaveTo(GlobalConfig.filePath)
	if err != nil {
		logger.Info("can't generate default config file: " + err.Error())
		return err
	}
	return nil
}

func SaveProxy(p Proxy) error {
	GlobalConfig.Proxy.Type = p.Type
	GlobalConfig.Proxy.Enable = p.Enable
	GlobalConfig.Proxy.Host = p.Host
	GlobalConfig.Proxy.Port = p.Port
	GlobalConfig.Proxy.User = p.User
	GlobalConfig.Proxy.Pass = p.Pass
	err := Save()
	if err != nil {
		logger.Info("can't store proxy to file")
		return err
	}
	if p.Enable {
		if p.User != "" {
			auth := p.User
			if p.Pass != "" {
				auth += ":" + p.Pass + "@"
				_ = ProxyManager.SetProxy(fmt.Sprintf("%s://%s%s:%s", p.Type, auth, p.Host, p.Port))
				logger.Info("proxy enabled on " + ProxyManager.ProxyString())
				return nil
			}
		}
		_ = ProxyManager.SetProxy(fmt.Sprintf("%s://%s:%s", p.Type, p.Host, p.Port))
		logger.Info("proxy enabled on " + ProxyManager.ProxyString())
		return nil
	}
	_ = ProxyManager.SetProxy("")
	logger.Info("proxy disabled")
	return nil
}
