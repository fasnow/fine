package main

import (
	"context"
	"embed"
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/runtime"
	service2 "fine/backend/service/service"
	"fine/backend/service/service/fofa"
	"fine/backend/service/service/httpx"
	"fine/backend/service/service/hunter"
	"fine/backend/service/service/icp"
	"fine/backend/service/service/ip138"
	"fine/backend/service/service/quake"
	"fine/backend/service/service/wechat"
	"fine/backend/service/service/zone"
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
			runtime.NewPath(),
			httpx.NewHttpxBridge(mainApp),
			config.GetSingleton(),
			icp.NewICPBridge(mainApp),
			ip138.NewIP138Bridge(mainApp),
			fofa.NewFofaBridge(mainApp),
			hunter.NewHunterBridge(mainApp),
			quake.NewQuakeBridge(mainApp),
			zone.NewZoneBridge(mainApp),
			wechat.NewWechatBridge(mainApp),
			//&wechat.Bridge{},
			service.NewDownloadLogService(),
			service.NewFofaDBService(),
			&service2.TT{},
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	}
	if err := wails.Run(opts); err != nil {
		println("Error:", err.Error())
	}
}
