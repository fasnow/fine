package main

import (
	"context"
	"embed"
	"fine/backend/application"
	"fine/backend/constant/event"
	history2 "fine/backend/constant/history"
	"fine/backend/constant/status"
	"fine/backend/osoperation"
	"fine/backend/service/service/aiqicha"
	"fine/backend/service/service/exportlog"
	"fine/backend/service/service/fofa"
	"fine/backend/service/service/history"
	"fine/backend/service/service/httpx"
	"fine/backend/service/service/hunter"
	"fine/backend/service/service/icp"
	"fine/backend/service/service/ip138"
	"fine/backend/service/service/quake"
	"fine/backend/service/service/shodan"
	"fine/backend/service/service/tianyancha"
	"fine/backend/service/service/wechat"
	"fine/backend/task"
	"github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"runtime"
	"time"
)

//go:embed all:frontend/dist
var assets embed.FS

var mainApp *application.Application

func main() {
	defaultWidth := 1200
	defaultHeight := 800
	mainApp = application.DefaultApp
	taskManager := task.Manager{ICP: icp.NewICPBridge(mainApp)}
	opts := &options.App{
		LogLevel: logger.DEBUG,
		Title:    "Fine",
		Width:    defaultWidth,
		Height:   defaultHeight,
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			event.EmitV2(event.AppExit, event.EventDetail{})
			if wailsRuntime.WindowIsMinimised(ctx) {
				wailsRuntime.WindowUnminimise(ctx)
			}
			wailsRuntime.WindowSetAlwaysOnTop(ctx, true)
			time.AfterFunc(100*time.Millisecond, func() {
				wailsRuntime.WindowShow(ctx)
				wailsRuntime.WindowSetAlwaysOnTop(ctx, false)
			})
			return true
		},
		Frameless: runtime.GOOS != "darwin",
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
			if wailsRuntime.Environment(ctx).BuildType == "dev" {
				mainApp.Logger.SetLevel(logrus.DebugLevel) // 日志等级
			}
			mainApp.SetContext(ctx)
			event.SetContext(ctx)

			//适配小屏
			screens, _ := wailsRuntime.ScreenGetAll(ctx)
			for _, screen := range screens {
				if screen.IsCurrent {
					width := defaultWidth
					height := defaultHeight
					if width >= screen.Size.Width {
						width = screen.Size.Width * 4 / 5
					}
					if height >= screen.Size.Height {
						height = screen.Size.Height * 4 / 5
					}
					wailsRuntime.WindowSetSize(ctx, width, height)
				}
			}
		},
		Bind: []interface{}{
			mainApp,
			&status.StatusEnum{},
			&history2.HistoryEnum{},
			&status.StatusEnum{},
			&event.EventDetail{},
			osoperation.NewRuntime(mainApp),
			osoperation.NewPath(),
			httpx.NewBridge(mainApp),
			taskManager.ICP,
			ip138.NewBridge(mainApp),
			fofa.NewBridge(mainApp),
			hunter.NewBridge(mainApp),
			quake.NewBridge(mainApp),
			shodan.NewBridge(mainApp),
			history.NewBridge(mainApp),
			wechat.NewBridge(mainApp),
			exportlog.NewBridge(mainApp),
			tianyancha.NewBridge(mainApp),
			aiqicha.NewBridge(mainApp),
		},
		//Debug: options.Debug{
		//	OpenInspectorOnStartup: true,
		//},
	}
	if err := wails.Run(opts); err != nil {
		mainApp.Logger.Info(err)
	}
}
