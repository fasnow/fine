package app

import (
	"context"
	"fine/backend/logger"
	"fine/backend/proxy"
	"github.com/pkg/errors"
	"io"
	"net/http"
)

// App struct
type App struct {
	ctx        context.Context
	HttpClient *http.Client
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{
		HttpClient: &http.Client{},
	}
	proxy.GetSingleton().Add(app)
	return app
}

func (a *App) SetContext(ctx context.Context) {
	a.ctx = ctx
	a.startup(ctx)
}

func (a *App) GetContext() context.Context {
	return a.ctx
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Fetch(url string) ([]byte, error) {
	request, _ := http.NewRequest("GET", url, nil)
	response, err := a.HttpClient.Do(request)
	if err != nil {
		logger.Info(err)
		return nil, err
	}
	if response.StatusCode != 200 {
		bytes, _ := io.ReadAll(response.Body)
		return nil, errors.New(string(bytes))
	}
	bytes, err := io.ReadAll(response.Body)
	return bytes, err
	//return []byte("1"), nil
}
