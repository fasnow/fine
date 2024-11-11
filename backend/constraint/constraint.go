package constraint

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/yitter/idgenerator-go/idgen"
	"strconv"
	"time"
)

type Event struct {
	WindowSizeChange               string `json:"windowSizeChange"`
	HasNewFofaDownloadItem         string `json:"hasNewFofaDownloadItem"`
	HasNewDownloadItem             string `json:"hasNewDownloadItem"`
	HasNewHunterDownloadItem       string `json:"hasNewHunterDownloadItem"`
	HunterQueryFinished            string `json:"hunterQueryFinished"`
	HasNewIcpDownloadItem          string `json:"hasNewIcpDownloadItem"`
	HasNewQuakeDownloadItem        string `json:"hasNewQuakeDownloadItem"`
	HasNew0zoneSiteDownloadItem    string `json:"hasNew0ZoneSiteDownloadItem"`
	HasNew0zoneMemberDownloadItem  string `json:"hasNew0ZoneMemberDownloadItem"`
	HasNew0zoneEmailDownloadItem   string `json:"hasNew0ZoneEmailDownloadItem"`
	HasNew0zoneDomainDownloadItem  string `json:"hasNew0ZoneDomainDownloadItem"`
	HttpxOutput                    string `json:"httpxOutput"`
	HttpxOutputDone                string `json:"httpxOutputDone"`
	DecompileWxMiniProgramOutput   string `json:"decompileWxMiniProgram"`
	DecompileWxMiniProgramDone     string `json:"decompileWxMiniProgramDone"`
	ExtractWxMiniProgramInfoOutput string `json:"extractWxMiniProgramInfoOutput"`
	ExtractWxMiniProgramInfoDone   string `json:"extractWxMiniProgramInfoDone"`
	Domain2IPOutput                string `json:"domain2IPOutput"`
	Domain2IPDown                  string `json:"domain2IPDown"`
	ICPOutput                      string `json:"icpOutput"`
	ICPDown                        string `json:"icpDown"`
	ICPBatchQuery                  string `json:"icpBatchQuery"`
}

type Status struct {
	InProgress int `json:"exporting,omitempty"`
	Completed  int `json:"completed,omitempty"`
	Deleted    int `json:"deleted,omitempty"`
	Error      int `json:"error,omitempty"`
	OK         int `json:"OK,omitempty"`
}

var Events = &Event{
	WindowSizeChange:               strconv.Itoa(int(idgen.NextId())),
	HasNewFofaDownloadItem:         strconv.Itoa(int(idgen.NextId())),
	HasNewDownloadItem:             strconv.Itoa(int(idgen.NextId())),
	HasNewHunterDownloadItem:       strconv.Itoa(int(idgen.NextId())),
	HunterQueryFinished:            strconv.Itoa(int(idgen.NextId())),
	HasNewIcpDownloadItem:          strconv.Itoa(int(idgen.NextId())),
	HasNewQuakeDownloadItem:        strconv.Itoa(int(idgen.NextId())),
	HasNew0zoneSiteDownloadItem:    strconv.Itoa(int(idgen.NextId())),
	HasNew0zoneMemberDownloadItem:  strconv.Itoa(int(idgen.NextId())),
	HasNew0zoneEmailDownloadItem:   strconv.Itoa(int(idgen.NextId())),
	HttpxOutput:                    strconv.Itoa(int(idgen.NextId())),
	HttpxOutputDone:                strconv.Itoa(int(idgen.NextId())),
	DecompileWxMiniProgramOutput:   strconv.Itoa(int(idgen.NextId())),
	DecompileWxMiniProgramDone:     strconv.Itoa(int(idgen.NextId())),
	ExtractWxMiniProgramInfoOutput: strconv.Itoa(int(idgen.NextId())),
	ExtractWxMiniProgramInfoDone:   strconv.Itoa(int(idgen.NextId())),
	Domain2IPOutput:                strconv.Itoa(int(idgen.NextId())),
	Domain2IPDown:                  strconv.Itoa(int(idgen.NextId())),
}

var Statuses = &Status{
	InProgress: 1,
	Completed:  2,
	Deleted:    3,
	Error:      4,
	OK:         5,
}

func init() {
	go loopWindowEvent()
}

func (r *Event) GetAllEvents() *Event {
	return Events
}

var ctx context.Context

func SetContext(context context.Context) {
	ctx = context
}

func HasNewDownloadLogItemEventEmit(eventName string) {
	runtime.EventsEmit(ctx, eventName)
	runtime.EventsEmit(ctx, Events.HasNewDownloadItem)
}

func Emit(eventName string, data any) {
	runtime.EventsEmit(ctx, eventName, data)
}

func loopWindowEvent() {
	for {
		time.Sleep(300 * time.Millisecond)
		if ctx == nil {
			continue
		}
		if t := runtime.WindowIsNormal(ctx); t {
			Emit(Events.WindowSizeChange, 0)
			continue
		}
		if t := runtime.WindowIsMaximised(ctx); t {
			Emit(Events.WindowSizeChange, 1)
			continue
		}
		if t := runtime.WindowIsMinimised(ctx); t {
			Emit(Events.WindowSizeChange, -1)
		}
	}
}
