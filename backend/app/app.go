package app

import (
	"context"
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/logger"
	"fine/backend/proxy/v2"
	"github.com/pkg/errors"
	"io"
	"net/http"
	"strconv"
	"strings"
)

// App struct
type App struct {
	ctx  context.Context
	http *http.Client
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{
		http: &http.Client{},
	}
	app.UseProxyManager(config.ProxyManager)
	return app
}

func (r *App) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func (r *App) SetContext(ctx context.Context) {
	r.ctx = ctx
	r.startup(ctx)
}

func (r *App) GetContext() context.Context {
	return r.ctx
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (r *App) startup(ctx context.Context) {
	r.ctx = ctx
}

func (r *App) Fetch(url string) ([]byte, error) {
	url = strings.TrimSpace(url)
	if url == "" {
		return nil, errors.New("目标地址不能为空")
	}
	request, _ := http.NewRequest("GET", url, nil)
	response, err := r.http.Do(request)
	if err != nil {
		logger.Info(err)
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(response.StatusCode))
	}
	bytes, err := io.ReadAll(response.Body)
	return bytes, err
	//return []byte("1"), nil
}

func (r *App) SaveProxy(proxy config.Proxy) error {
	config.GlobalConfig.Proxy = proxy
	err := config.Save()
	if err != nil {
		logger.Info(err)
		return err
	}
	return nil
}

func (r *App) SaveQueryOnEnter(queryOnEnter config.QueryOnEnter) error {
	config.GlobalConfig.QueryOnEnter = queryOnEnter
	err := config.Save()
	if err != nil {
		logger.Info(err)
		return err
	}
	return nil
}

func (r *App) SaveWechat(wechat config.Wechat) error {
	config.GlobalConfig.Wechat = wechat
	err := config.Save()
	if err != nil {
		logger.Info(err)
		return err
	}
	return nil
}

func (r *App) GetAllConstants() Constant {
	return Constant{
		Event:   constant.Events,
		Status:  constant.Statuses,
		History: constant.Histories,
		Config:  config.GlobalConfig,
	}
}

type Constant struct {
	Event   *constant.Event   `json:"event"`
	Status  *constant.Status  `json:"status"`
	History *constant.History `json:"history"`
	Config  *config.Config    `json:"config"`
}
