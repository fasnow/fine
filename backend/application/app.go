package application

import (
	"context"
	"fine/backend/config"
	"fine/backend/constant/event"
	"fine/backend/constant/history"
	"fine/backend/constant/status"
	"fine/backend/logger"
	"fine/backend/proxy/v2"
	"fine/backend/utils"
	"fmt"
	"github.com/buger/jsonparser"
	"github.com/hashicorp/go-version"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/yitter/idgenerator-go/idgen"
	"gopkg.in/ini.v1"
	"gopkg.in/yaml.v3"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

const Version = "2.0.0"

func init() {
	ini.PrettyFormat = false
	// 创建 IdGeneratorOptions 对象，可在构造函数中输入 WorkerId：
	var idgenOpts = idgen.NewIdGeneratorOptions(1)
	// options.WorkerIdBitLength = 10  // 默认值6，限定 WorkerId 最大值为2^6-1，即默认最多支持64个节点。
	// options.SeqBitLength = 6; // 默认值6，限制每毫秒生成的ID个数。若生成速度超过5万个/秒，建议加大 SeqBitLength 到 10。
	// options.BaseTime = Your_Base_Time // 如果要兼容老系统的雪花算法，此处应设置为老系统的BaseTime。
	// ...... 其它参数参考 IdGeneratorOptions 定义。
	// 保存参数（务必调用，否则参数设置不生效）：
	idgen.SetIdGenerator(idgenOpts)
}

var iniOptions = ini.LoadOptions{
	SkipUnrecognizableLines:  true, //跳过无法识别的行
	SpaceBeforeInlineComment: true,
	AllowShadows:             true,
}

var defaultConfig = &config.Config{
	Timeout: 20 * time.Second,
	Proxy: config.Proxy{
		Enable: false,
		Type:   "http",
		Host:   "127.0.0.1",
		Port:   "8080",
		User:   "",
		Pass:   "",
	},
	Fofa: config.Fofa{
		Interval: 300 * time.Millisecond,
	},
	Hunter: config.Hunter{
		Interval: 1500 * time.Millisecond,
	},
	Quake: config.Quake{
		Interval: 1000 * time.Millisecond,
	},
	Zone: config.Zone{
		Interval: 1000 * time.Millisecond,
	},
	ICP: config.ICP{
		Timeout: 10 * time.Second,
		Proxy: config.Proxy{
			Enable: false,
			Type:   "http",
			Host:   "127.0.0.1",
			Port:   "8080",
			User:   "",
			Pass:   "",
		},
		AuthErrorRetryNum1:      3,
		ForbiddenErrorRetryNum1: 1,
		AuthErrorRetryNum2:      999,
		ForbiddenErrorRetryNum2: 999,
		Concurrency:             5,
	},
	TianYanCha: config.TianYanCha{Token: ""},
	AiQiCha:    config.AiQiCha{Cookie: ""},
	Httpx: config.Httpx{
		Path:  "",
		Flags: "-sc -cl -title",
	},
	Wechat: config.Wechat{Rules: DefaultRegex},
}

var DefaultApp = NewApp()

type Application struct {
	Ctx          context.Context
	Config       *config.Config
	ConfigFile   string
	AppDir       string
	http         *http.Client
	ProxyManager *proxy.Manager
	Logger       *logrus.Logger
	UserHome     string
}

func NewApp() *Application {
	app := &Application{
		Config:       &config.Config{},
		ProxyManager: proxy.NewManager(),
	}
	app.init()
	app.UseProxyManager(app.ProxyManager)
	return app
}

func (r *Application) init() {
	r.AppDir = filepath.Dir(os.Args[0])
	if runtime.GOOS != "windows" {
		// 如果无法获取家目录则调用操作系统弹窗提示
		if t, err := os.UserHomeDir(); err != nil {
			ShowErrorMessage(err.Error())
			os.Exit(1)
		} else {
			r.UserHome = t
			r.AppDir = filepath.Join(r.UserHome, "fine")
		}
	}
	r.ConfigFile = filepath.Join(r.AppDir, "config.ini")
	if utils.FileExist(r.ConfigFile) {
		// ini 转 yaml
		if err := r.transformConfigFile(); err != nil {
			ShowErrorMessage(err.Error())
			os.Exit(1)
		}
	} else {
		r.ConfigFile = filepath.Join(r.AppDir, "config.yaml")
		if utils.FileExist(r.ConfigFile) {
			if err := r.loadConfigFile(); err != nil {
				ShowErrorMessage(err.Error())
				os.Exit(1)
			}
		} else {
			if err := r.generateConfigFile(); err != nil {
				ShowErrorMessage(err.Error())
				os.Exit(1)
			}
		}
	}
}

func (r *Application) transformConfigFile() error {
	cfg, err := ini.LoadSources(iniOptions, r.ConfigFile)
	if err != nil {
		msg := "can't open config file:" + err.Error()
		return errors.New(msg)
	}
	if err = cfg.MapTo(r.Config); err != nil {
		msg := "can't map to config file:" + err.Error()
		return errors.New(msg)
	}
	r.Config.Wechat.Rules = DefaultRegex // 丢弃以前的规则
	r.ConfigFile = filepath.Join(r.AppDir, "config.yaml")
	if err := r.WriteConfig(r.Config); err != nil {
		return err
	}
	r.Logger = logger.NewWithLogDir(r.Config.LogDataDir)

	if err := os.Remove(filepath.Join(r.AppDir, "config.ini")); err != nil {
		r.Logger.Error(err)
	}
	return r.loadConfigFile()
}

func (r *Application) loadConfigFile() error {
	readData, err := os.ReadFile(r.ConfigFile)
	if err != nil {
		return err
	}
	if err := yaml.Unmarshal(readData, r.Config); err != nil {
		return err
	}
	var needUpdate = false
	if r.Config.LogDataDir == "" {
		r.Config.LogDataDir = filepath.Join(r.AppDir, "data", "log")
		needUpdate = true
	}
	if r.Config.DatabaseFile == "" {
		r.Config.DatabaseFile = filepath.Join(r.AppDir, "data", "data.db")
		needUpdate = true
	}
	if r.Config.ExportDataDir == "" {
		r.Config.ExportDataDir = filepath.Join(r.AppDir, "data", "export")
		needUpdate = true
	}
	if r.Config.WechatDataDir == "" {
		r.Config.WechatDataDir = filepath.Join(r.AppDir, "data", "wechat")
		needUpdate = true
	}
	if r.Config.ICP.AuthErrorRetryNum1 <= 0 {
		r.Config.ICP.AuthErrorRetryNum1 = 3
		needUpdate = true
	}
	if r.Config.ICP.ForbiddenErrorRetryNum1 <= 0 {
		r.Config.ICP.ForbiddenErrorRetryNum1 = 1
		needUpdate = true
	}
	if r.Config.ICP.AuthErrorRetryNum2 <= 0 {
		r.Config.ICP.AuthErrorRetryNum2 = 999
		needUpdate = true
	}
	if r.Config.ICP.ForbiddenErrorRetryNum2 <= 0 {
		r.Config.ICP.ForbiddenErrorRetryNum2 = 999
		needUpdate = true
	}
	currentVersion, _ := version.NewVersion(Version)
	configFileVersion, err := version.NewVersion(r.Config.Version)
	if err != nil || currentVersion.GreaterThan(configFileVersion) {
		r.Config.Version = Version
		r.Config.Wechat.Rules = utils.RemoveEmptyAndDuplicateString(append(r.Config.Wechat.Rules, DefaultRegex...))
		needUpdate = true
	}
	if needUpdate {
		return r.WriteConfig(r.Config)
	}

	r.Logger = logger.NewWithLogDir(r.Config.LogDataDir)

	//代理
	if r.Config.Proxy.Enable {
		var p string
		if r.Config.Proxy.User != "" && r.Config.Proxy.Pass != "" {
			p = fmt.Sprintf("%s://%s:%s@%s:%s", r.Config.Proxy.Type, r.Config.Proxy.User, r.Config.Proxy.Pass, r.Config.Proxy.Host, r.Config.Proxy.Port)
		} else {
			p = fmt.Sprintf("%s://%s:%s", r.Config.Proxy.Type, r.Config.Proxy.Host, r.Config.Proxy.Port)
		}
		if err := r.ProxyManager.SetProxy(p); err != nil {
			r.Logger.Error("set global proxy error: " + err.Error())
		}
		r.Logger.Info("global proxy enabled on " + r.ProxyManager.ProxyString())
	} else {
		r.Logger.Info("global proxy disabled")
	}

	//超时
	r.ProxyManager.SetTimeout(r.Config.Timeout)
	r.Logger.Info(fmt.Sprintf("set global timeout %fs", r.ProxyManager.GetClient().Timeout.Seconds()))
	return nil
}

func (r *Application) generateConfigFile() error {
	defaultConfig.LogDataDir = filepath.Join(r.AppDir, "data", "log")
	defaultConfig.DatabaseFile = filepath.Join(r.AppDir, "data", "data.db")
	defaultConfig.WechatDataDir = filepath.Join(r.AppDir, "data", "wechat")
	defaultConfig.ExportDataDir = filepath.Join(r.AppDir, "data", "export")

	r.Logger = logger.NewWithLogDir(defaultConfig.LogDataDir)
	r.Logger.Info("config file not found, generating default config file...")

	if runtime.GOOS != "windows" {
		// 非 windows 下微信小程序默认目录
		defaultConfig.Wechat.Applet = filepath.Join(r.UserHome, "Library/Containers/com.tencent.xinWeChat/Data/.wxapplet/packages")
	}

	// 应用默认配置
	r.Config = defaultConfig

	// 保存到本地
	if err := r.WriteConfig(defaultConfig); err != nil {
		msg := "can't generate default config file: " + err.Error()
		return errors.New(msg)
	}

	r.Logger.Info("generate default config file successfully, locate at " + r.ConfigFile + ", run with default config")

	// 超时
	r.ProxyManager.SetTimeout(r.Config.Timeout)
	r.Logger.Info(fmt.Sprintf("set timeout %fs", r.ProxyManager.GetClient().Timeout.Seconds()))

	return nil
}

func (r *Application) CheckRunningTask() {

}

// Exit 关闭应用
func (r *Application) Exit() {
	os.Exit(0)
}

func ShowErrorMessage(message string) {
	switch runtime.GOOS {
	case "darwin":
		exec.Command("osascript", "-e", `display dialog "`+message+`" buttons {"OK"} default button 1`).Run()
	case "windows":
		exec.Command("powershell", "-Command", `[System.Windows.Forms.MessageBox]::Show('`+message+`', 'Error', 'OK')`).Run()
	case "linux":
		exec.Command("zenity", "--error", "--text", message).Run()
	default:
		panic(message)
	}
}

func (r *Application) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func (r *Application) SetContext(ctx context.Context) {
	r.startup(ctx)
}

func (r *Application) GetContext() context.Context {
	return r.Ctx
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (r *Application) startup(ctx context.Context) {
	r.Ctx = ctx
}

func (r *Application) Fetch(url string) ([]byte, error) {
	url = strings.TrimSpace(url)
	if url == "" {
		return nil, errors.New("目标地址不能为空")
	}
	request, _ := http.NewRequest("GET", url, nil)
	response, err := r.http.Do(request)
	if err != nil {
		r.Logger.Info(err)
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(response.StatusCode))
	}
	bytes, err := io.ReadAll(response.Body)
	return bytes, err
}

func (r *Application) CheckUpdate() (map[string]string, error) {
	request, err := http.NewRequest("GET", "https://api.github.com/repos/fasnow/fine/releases/latest", nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
		}
	}(resp.Body)
	body, err := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(resp.StatusCode))
	}
	tagName, err := jsonparser.GetString(body, "tag_name")
	if err != nil {
		return nil, err
	}
	htmlUrl, err := jsonparser.GetString(body, "html_url")
	if err != nil {
		return nil, err
	}
	description, err := jsonparser.GetString(body, "body")
	if err != nil {
		return nil, err
	}
	return map[string]string{
		"version":     tagName,
		"description": description,
		"url":         htmlUrl,
	}, nil
}

func (r *Application) SaveProxy(proxy config.Proxy) error {
	r.Config.Proxy.Type = proxy.Type
	r.Config.Proxy.Enable = proxy.Enable
	r.Config.Proxy.Host = proxy.Host
	r.Config.Proxy.Port = proxy.Port
	r.Config.Proxy.User = proxy.User
	r.Config.Proxy.Pass = proxy.Pass
	if err := r.WriteConfig(r.Config); err != nil {
		msg := "can't store global proxy to file"
		r.Logger.Info(msg)
		return errors.New(msg)
	}
	if proxy.Enable {
		if proxy.User != "" {
			auth := proxy.User
			if proxy.Pass != "" {
				auth += ":" + proxy.Pass + "@"
				_ = r.ProxyManager.SetProxy(fmt.Sprintf("%s://%s%s:%s", proxy.Type, auth, proxy.Host, proxy.Port))
				r.Logger.Info("global proxy enabled on " + r.ProxyManager.ProxyString())
				return nil
			}
		}
		_ = r.ProxyManager.SetProxy(fmt.Sprintf("%s://%s:%s", proxy.Type, proxy.Host, proxy.Port))
		r.Logger.Info("global proxy enabled on " + r.ProxyManager.ProxyString())
		return nil
	}
	_ = r.ProxyManager.SetProxy("")
	r.Logger.Info("global proxy disabled")
	return nil
}

func (r *Application) WriteConfig(conf *config.Config) error {
	bytes, err := yaml.Marshal(conf)
	if err != nil {
		return err
	}
	return utils.WriteFile(r.ConfigFile, bytes, 0764)
}

func (r *Application) SaveQueryOnEnter(queryOnEnter config.QueryOnEnter) error {
	r.Config.QueryOnEnter = queryOnEnter
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) SaveWechat(wechat config.Wechat) error {
	r.Config.Wechat = wechat
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) SaveTimeout(timeout time.Duration) error {
	r.Config.Timeout = timeout
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	r.ProxyManager.SetTimeout(timeout)
	return nil
}

func (r *Application) SaveDatabaseFile(file string) error {
	r.Config.DatabaseFile = file
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) SaveExportDataDir(dir string) error {
	r.Config.ExportDataDir = dir
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) SaveWechatDataDir(dir string) error {
	r.Config.WechatDataDir = dir
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) SaveLogDataDir(dir string) error {
	r.Config.LogDataDir = dir
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) SaveICPConfig(cfg config.ICP) error {
	r.Config.ICP.AuthErrorRetryNum1 = cfg.AuthErrorRetryNum1
	r.Config.ICP.AuthErrorRetryNum2 = cfg.AuthErrorRetryNum2
	r.Config.ICP.ForbiddenErrorRetryNum1 = cfg.ForbiddenErrorRetryNum1
	r.Config.ICP.ForbiddenErrorRetryNum2 = cfg.ForbiddenErrorRetryNum2
	r.Config.ICP.Concurrency = cfg.Concurrency
	err := r.WriteConfig(r.Config)
	if err != nil {
		r.Logger.Info(err)
		return err
	}
	return nil
}

func (r *Application) GetWechatRules() []string {
	var t []string
	for _, rule := range r.Config.Wechat.Rules {
		tt := strconv.Quote(rule)
		t = append(t, tt[1:len(tt)-1])
	}
	return t
}

func (r *Application) SaveWechatRules(rules []string) error {
	var t []string
	for _, rule := range rules {
		tt := fmt.Sprintf("\"%s\"", rule)
		ttt, err := strconv.Unquote(tt)
		if err != nil {
			return errors.New("语法错误：" + tt)
		}
		t = append(t, ttt)
	}
	r.Config.Wechat.Rules = t
	return r.WriteConfig(r.Config)
}

func (r *Application) GetAllConstants() *Constant {
	var statuses = status.StatusEnum{
		Pending: status.Pending,
		Running: status.Running,
		Paused:  status.Paused,
		Stopped: status.Stopped,
		Deleted: status.Deleted,
		Error:   status.Error,
		OK:      status.OK,
		Waiting: status.Waiting,
		ReRun:   status.ReRun,
		Pausing: status.Pausing,
	}
	var events = event.EventEnum{
		AppExit:                   event.AppExit,
		WindowSizeChange:          event.WindowSizeChange,
		FOFAExport:                event.FOFAExport,
		NewDownloadItem:           event.NewExportItem,
		NewExportLog:              event.NewExportLog,
		HunterExport:              event.HunterExport,
		HunterQuery:               event.HunterQuery,
		ICPExport:                 event.ICPExport,
		QuakeExport:               event.QuakeExport,
		ZoneSiteExport:            event.ZoneSiteExport,
		ZoneMemberExport:          event.ZoneMemberExport,
		ZoneEmailExport:           event.ZoneEmailExport,
		Httpx:                     event.Httpx,
		DecompileWxMiniProgram:    event.DecompileWxMiniProgram,
		ICPBatchQuery:             event.ICPBatchQuery,
		ICPBatchQueryStatusUpdate: event.ICPBatchQueryStatusUpdate,
		AiQiCha:                   event.AiQiCha,
	}

	var histories = history.HistoryEnum{
		FOFA:   history.FOFA,
		Hunter: history.Hunter,
		Quake:  history.Quake,
		Zone:   history.Zone,
		ICP:    history.ICP,
		TYC:    history.TYC,
		AQC:    history.AQC,
	}
	return &Constant{
		Event:   events,
		Status:  statuses,
		History: histories,
		Config:  *r.Config,
	}
}

func (r *Application) EvenDetail() *event.EventDetail {
	return nil
}

type Constant struct {
	Event   event.EventEnum     `json:"event"`
	Status  status.StatusEnum   `json:"status"`
	History history.HistoryEnum `json:"history"`
	Config  config.Config       `json:"config"`
}
