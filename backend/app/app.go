package app

import (
	"context"
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
}

func (a *App) GetContext() context.Context {
	return a.ctx
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}
