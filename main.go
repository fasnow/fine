package main

import (
	"context"
	"embed"
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/runtime"
	"fine/backend/service/service/domain2ip"
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
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	runtime2 "runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	defaultWidth := 1200
	defaultHeight := 768
	mainApp := app.NewApp()
	opts := &options.App{
		Title:  "Fine",
		Width:  defaultWidth,
		Height: defaultHeight,
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			if runtime2.GOOS == "windows" {
				r, _ := wailsRuntime.MessageDialog(ctx, wailsRuntime.MessageDialogOptions{
					Type:          wailsRuntime.QuestionDialog,
					Title:         "退出",
					Message:       "确认退出吗？",
					Buttons:       []string{"确认", "取消"},
					DefaultButton: "确认",
					CancelButton:  "取消",
				})
				return r != "Yes"
			}
			r, _ := wailsRuntime.MessageDialog(ctx, wailsRuntime.MessageDialogOptions{
				Type:          wailsRuntime.WarningDialog,
				Title:         "确定退出吗？",
				Buttons:       []string{"确认", "取消"},
				DefaultButton: "确认",
				CancelButton:  "取消",
			})
			return r == "取消"
		},
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

			//适配小屏
			screens, _ := wailsRuntime.ScreenGetAll(ctx)
			for _, screen := range screens {
				if screen.IsCurrent {
					width := screen.Size.Width
					height := screen.Size.Height
					if width < defaultWidth {
						width = width * 4 / 5
					}
					if height < defaultHeight {
						height = height * 4 / 5
					}
					wailsRuntime.WindowSetSize(ctx, width, defaultHeight)
				}
			}
		},
		Bind: []interface{}{
			mainApp,
			config.GetSingleton(),
			event.GetSingleton(),
			runtime.NewRuntime(mainApp),
			runtime.NewPath(),
			httpx.NewHttpxBridge(mainApp),
			icp.NewICPBridge(mainApp),
			ip138.NewIP138Bridge(mainApp),
			fofa.NewFofaBridge(mainApp),
			hunter.NewHunterBridge(mainApp),
			quake.NewQuakeBridge(mainApp),
			zone.NewZoneBridge(mainApp),
			wechat.NewWechatBridge(mainApp),
			service.NewDownloadLogService(),
			service.NewFofaDBService(),
			domain2ip.NewDomain2IPBridge(mainApp),
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	}
	if err := wails.Run(opts); err != nil {
		logger.Info(err.Error())
		println("Error:", err.Error())
	}
}
