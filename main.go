package main

import (
	"context"
	"embed"
	app "fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/service"
	"fine/backend/runtime"
	"fine/backend/sdk/client/fofa"
	"fine/backend/sdk/client/httpx"
	"fine/backend/sdk/client/hunter"
	"fine/backend/sdk/client/icp"
	"fine/backend/sdk/client/ip138"
	"fine/backend/sdk/client/quake"
	"fine/backend/sdk/client/zone"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	mainApp := app.NewApp()
	opts := &options.App{
		Title:     "fine",
		Width:     1200,
		Height:    768,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			mainApp.SetContext(ctx)
		},
		Bind: []interface{}{
			mainApp,
			runtime.NewRuntime(mainApp),
			httpx.NewHttpxBridge(mainApp),
			config.GetConfig(),
			service.NewDownloadLogService(),
			service.NewFofaDBService(),
			icp.NewICPBridge(mainApp),
			ip138.NewIP138Bridge(mainApp),
			fofa.NewFofaBridge(mainApp),
			hunter.NewHunterBridge(mainApp),
			quake.NewQuakeBridge(mainApp),
			zone.NewZoneBridge(mainApp),
		},
	}
	if err := wails.Run(opts); err != nil {
		println("Error:", err.Error())
	}
}
