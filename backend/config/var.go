package config

type modeType string

var (
	baseDir         string
	file            string
	downloadLogFile string
	dataDir         string
)

const defaultTimeout = 15

var defaultInterval = Interval{
	Fofa:   300, //实际限制速率不是这个值
	Hunter: 1500,
	Quake:  1000,
	Zone:   1000,
}
var defaultConfig = Config{
	Timeout:  defaultTimeout,
	Interval: defaultInterval,
}

var cfg = Config{}

type Config struct {
	Auth     Auth  `yaml:"auth" json:"auth"`
	Proxy    Proxy `yaml:"proxy" json:"proxy"`
	Interval `yaml:"interval" json:"interval"`
	Timeout  int `yaml:"timeout" json:"timeout"` //秒
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

const (
	FofaName   = "Fofa"
	HunterName = "Hunter"
	QuakeName  = "Quake"
	ZoneName   = "0.zone"
)

// GetDefaultTimeout second
func GetDefaultTimeout() int {
	return defaultTimeout
}

func GetDefaultInterval() Interval {
	return defaultInterval
}
