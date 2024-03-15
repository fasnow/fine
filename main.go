package main

import (
	"context"
	"embed"
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/runtime"
	"fine/backend/service/client/fofa"
	"fine/backend/service/client/httpx"
	"fine/backend/service/client/hunter"
	"fine/backend/service/client/icp"
	"fine/backend/service/client/ip138"
	"fine/backend/service/client/quake"
	wechat "fine/backend/service/client/wx"
	"fine/backend/service/client/zone"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	runtime2 "runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	mainApp := app.NewApp()
	opts := &options.App{
		Title:     "Fine",
		Width:     1200,
		Height:    768,
		Frameless: runtime2.GOOS != "darwin",
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Mac: &mac.Options{
			TitleBar: mac.TitleBarHiddenInset(),
			//WebviewIsTransparent: false,
			//WindowIsTranslucent:  true,
		},
		Windows: &windows.Options{
			//WebviewIsTransparent:              true,
			//WindowIsTranslucent:               true,
			//DisableFramelessWindowDecorations: true,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			mainApp.SetContext(ctx)
			event.SetContext(ctx)
		},
		Bind: []interface{}{
			mainApp,
			event.GetSingleton(),
			runtime.NewRuntime(mainApp),
			httpx.NewHttpxBridge(mainApp),
			config.GetSingleton(),
			service.NewDownloadLogService(),
			service.NewFofaDBService(),
			icp.NewICPBridge(mainApp),
			ip138.NewIP138Bridge(mainApp),
			fofa.NewFofaBridge(mainApp),
			hunter.NewHunterBridge(mainApp),
			quake.NewQuakeBridge(mainApp),
			zone.NewZoneBridge(mainApp),
			runtime.NewPath(),
			wechat.NewWechatBridge(mainApp),
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	}
	if err := wails.Run(opts); err != nil {
		println("Error:", err.Error())
	}
}
