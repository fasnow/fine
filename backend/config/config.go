package config

import (
	"sync"
)

var (
	once        sync.Once
	cfgInstance Config
)

func GetSingleton() *Config {
	once.Do(func() {
		cfgInstance = Config{}
	})
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
	AppletPath string `yaml:"appletPath" json:"appletPath"`
	DataPath   string `json:"dataCachePath"`
}
