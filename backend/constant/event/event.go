package event

import (
	"context"
	"fine/backend/constant/status"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"time"
)

const (
	AppExit                      = "AppExit"
	WindowSizeChange             = "WindowSizeChange"
	FOFAExport                   = "FOFAExport"
	NewExportItem                = "NewExportItem"
	NewExportLog                 = "NewExportItem"
	HunterExport                 = "HunterExport"
	HunterQuery                  = "HunterQuery"
	ICPExport                    = "ICPExport"
	QuakeExport                  = "QuakeExport"
	ZoneSiteExport               = "ZoneSiteExport"
	ZoneMemberExport             = "ZoneMemberExport"
	ZoneEmailExport              = "ZoneEmailExport"
	Httpx                        = "Httpx"
	DecompileWxMiniAPP           = "DecompileWxMiniAPP"
	DecompileWxMiniAPPTicker     = "DecompileWxMiniAPPTicker"
	DecompileWxMiniAPPInfoTicker = "DecompileWxMiniAPPInfoTicker"
	ICPBatchQuery                = "ICPBatchQuery"
	ICPBatchQueryStatusUpdate    = "ICPBatchQueryStatusUpdate"
	AiQiCha                      = "AiQiCha"
)

type EventEnum struct {
	AppExit                      string
	WindowSizeChange             string
	FOFAExport                   string
	NewDownloadItem              string
	NewExportLog                 string
	HunterExport                 string
	HunterQuery                  string
	ICPExport                    string
	QuakeExport                  string
	ZoneSiteExport               string
	ZoneMemberExport             string
	ZoneEmailExport              string
	Httpx                        string
	DecompileWxMiniAPP           string
	DecompileWxMiniAPPTicker     string
	DecompileWxMiniAPPInfoTicker string
	ICPBatchQuery                string
	ICPBatchQueryStatusUpdate    string
	AiQiCha                      string
}

func init() {
	go loopWindowEvent()
}

var ctx context.Context

func SetContext(context context.Context) {
	ctx = context
}

func EmitNewExportItemEvent(eventName string, data EventDetail) {
	runtime.EventsEmit(ctx, eventName, data)
	runtime.EventsEmit(ctx, NewExportItem)
}

func Emit(eventName string, data EventDetail) {
	runtime.EventsEmit(ctx, eventName, data)
}

type EventDetail struct {
	ID      int64
	Status  int
	Message string
	Error   string
	Data    any
}

func EmitV2(eventName string, data EventDetail) {
	runtime.EventsEmit(ctx, eventName, data)
}

func loopWindowEvent() {
	for {
		time.Sleep(300 * time.Millisecond)
		if ctx == nil {
			continue
		}
		if t := runtime.WindowIsNormal(ctx); t {
			Emit(WindowSizeChange, EventDetail{
				Status: status.OK,
				Data:   0,
			})
			continue
		}
		if t := runtime.WindowIsMaximised(ctx); t {
			Emit(WindowSizeChange, EventDetail{
				Status: status.OK,
				Data:   1,
			})
			continue
		}
		if t := runtime.WindowIsMinimised(ctx); t {
			Emit(WindowSizeChange, EventDetail{
				Status: status.OK,
				Data:   -1,
			})
		}
	}
}
