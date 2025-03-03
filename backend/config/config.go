package config

import (
	"time"
)

type Fofa struct {
	Token    string        `ini:"token" `
	Interval time.Duration `ini:"interval"  comment:"接口请求间隔，默认:0.3s"`
}
type Hunter struct {
	Token    string        `ini:"token" `
	Interval time.Duration `ini:"interval"  comment:"接口请求间隔，默认:1.5s"`
}
type Quake struct {
	Token    string        `ini:"token" `
	Interval time.Duration `ini:"interval"  comment:"接口请求间隔，默认:1s"`
}
type Zone struct {
	Token    string        `ini:"token" `
	Interval time.Duration `ini:"interval"  comment:"接口请求间隔，默认:1s"`
}
type Proxy struct {
	Enable bool   `ini:"enable" `
	Type   string `ini:"type"  comment:"http,socks5"`
	Host   string `ini:"host" `
	Port   string `ini:"port" `
	User   string `ini:"user" `
	Pass   string `ini:"pass" `
}

type Rule struct {
	Adafruit bool
	Airtable bool
	Algolia  bool
	Beamer   bool
	Branch   bool
}

type Wechat struct {
	Applet string `ini:"applet" `
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AirtableAPIKey bool   `ini:"Airtable_API_Key"`
	//AlgoliaAPIKey  bool   `ini:"Algolia_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	//AdafruitAPIKey bool   `ini:"Adafruit_API_Key"`
	DecompileConcurrency int
	ExtractConcurrency   int
	Rules                []string `ini:"rule,,allowshadow"  comment:"清空则会生成默认值"`
}

type Httpx struct {
	Path  string `ini:"path" `
	Flags string `ini:"flags"  comment:"程序参数（不包括目标输入参数标志）"`
}

type DNS struct {
	Value []string `ini:"value,,allowshadow" `
}

type QueryOnEnter struct {
	Assets bool `ini:"assets" `
	ICP    bool `ini:"icp" `
	IP138  bool `ini:"ip138" `
}

type TianYanCha struct {
	Token string `ini:"token"  comment:"X-AUTH-TOKEN"`
}

type AiQiCha struct {
	Cookie string `ini:"cookie"  comment:"cookie"`
}

type ICP struct {
	Timeout                 time.Duration `ini:"timeout"  comment:"批量查询时的代理超时时间"`
	Proxy                   Proxy         `ini:"IcpProxy"  comment:"ICP代理,优先级高于全局"`
	AuthErrorRetryNum1      uint64        `ini:"authErrorRetryNum1"  comment:"单查询时认证错误重试次数"`
	ForbiddenErrorRetryNum1 uint64        `ini:"forbiddenErrorRetryNum1"  comment:"单查询时403错误误重试次数，不使用代理时建议设为0"`
	AuthErrorRetryNum2      uint64        `ini:"authErrorRetryNum2"  comment:"批量查询时认证错误重试次数"`
	ForbiddenErrorRetryNum2 uint64        `ini:"forbiddenErrorRetryNum2"  comment:"批量查询403错误误重试次数"`
	Concurrency             uint64        `ini:"limit"  comment:"最大线程数"`
}

type Config struct {
	Version       string
	DatabaseFile  string        `ini:"databaseFile" `
	WechatDataDir string        `ini:"wechatDataDir" `
	ExportDataDir string        `ini:"exportDataDir" `
	LogDataDir    string        `ini:"logDataDir" `
	Timeout       time.Duration `ini:"timeout"  comment:"全局HTTP超时（不含Httpx），默认:20s"`
	Proxy         Proxy         `comment:"全局代理"`
	Fofa          Fofa
	Hunter        Hunter
	Quake         Quake
	Zone          Zone `ini:"0.zone"`
	ICP           ICP
	TianYanCha    TianYanCha
	AiQiCha       AiQiCha
	Wechat        Wechat
	Httpx         Httpx
	QueryOnEnter  QueryOnEnter
}
