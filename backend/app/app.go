package app

import (
	"context"
	"fmt"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func (a *App) SetContext(ctx context.Context) {
	a.ctx = ctx
	a.startup(ctx)
	wailsRuntime.EventsOn(ctx, "test", func(data ...interface{}) {
		fmt.Println("11111111111111111111")
	})
}

func (a *App) GetContext() context.Context {
	return a.ctx
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}
