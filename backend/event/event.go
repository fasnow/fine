package event

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/yitter/idgenerator-go/idgen"
	"strconv"
	"sync"
	"time"
)

type EventName int

type Value struct {
	WindowSizeChange              EventName `json:"windowSizeChange"`
	HasNewFofaDownloadItem        EventName `json:"hasNewFofaDownloadItem"`
	HasNewDownloadItem            EventName `json:"hasNewDownloadItem"`
	HasNewHunterDownloadItem      EventName `json:"hasNewHunterDownloadItem"`
	HunterQueryFinished           EventName `json:"hunterQueryFinished"`
	HasNewIcpDownloadItem         EventName `json:"hasNewIcpDownloadItem"`
	HasNewQuakeDownloadItem       EventName `json:"hasNewQuakeDownloadItem"`
	HasNew0zoneSiteDownloadItem   EventName `json:"hasNew0ZoneSiteDownloadItem"`
	HasNew0zoneMemberDownloadItem EventName `json:"hasNew0ZoneMemberDownloadItem"`
	HasNew0zoneEmailDownloadItem  EventName `json:"hasNew0ZoneEmailDownloadItem"`
	HasNew0zoneDomainDownloadItem EventName `json:"hasNew0ZoneDomainDownloadItem"`
	HttpxOuput                    EventName `json:"httpxOuput"`
	HttpxOuputDone                EventName `json:"httpxOuputDone"`
	DecompileWxMiniProgram        EventName `json:"decompileWxMiniProgram"`
}

type Event struct {
	Value
}

var once sync.Once
var event *Event

func init() {
	go loopWindowEvent()
}

func GetSingleton() *Event {
	once.Do(func() {
		event = &Event{
			Value{
				WindowSizeChange:              EventName(idgen.NextId()),
				HasNewFofaDownloadItem:        EventName(idgen.NextId()),
				HasNewDownloadItem:            EventName(idgen.NextId()),
				HasNewHunterDownloadItem:      EventName(idgen.NextId()),
				HunterQueryFinished:           EventName(idgen.NextId()),
				HasNewIcpDownloadItem:         EventName(idgen.NextId()),
				HasNewQuakeDownloadItem:       EventName(idgen.NextId()),
				HasNew0zoneSiteDownloadItem:   EventName(idgen.NextId()),
				HasNew0zoneMemberDownloadItem: EventName(idgen.NextId()),
				HasNew0zoneEmailDownloadItem:  EventName(idgen.NextId()),
				HttpxOuput:                    EventName(idgen.NextId()),
				HttpxOuputDone:                EventName(idgen.NextId()),
				DecompileWxMiniProgram:        EventName(idgen.NextId()),
			},
		}
	})
	return event
}

func (r *Event) GetAllEvents() *Event {
	return event
}

var ctx context.Context

func SetContext(context context.Context) {
	ctx = context
}

func HasNewDownloadLogItemEventEmit(eventName EventName) {
	runtime.EventsEmit(ctx, strconv.Itoa(int(eventName)))
	runtime.EventsEmit(ctx, strconv.Itoa(int(GetSingleton().HasNewDownloadItem)))
}

func Emit(eventName EventName, data any) {
	runtime.EventsEmit(ctx, strconv.Itoa(int(eventName)), data)
}

func loopWindowEvent() {
	for {
		time.Sleep(300 * time.Millisecond)
		if ctx == nil {
			continue
		}
		if t := runtime.WindowIsNormal(ctx); t {
			Emit(GetSingleton().WindowSizeChange, 0)
			continue
		}
		if t := runtime.WindowIsMaximised(ctx); t {
			Emit(GetSingleton().WindowSizeChange, 1)
			continue
		}
		if t := runtime.WindowIsMinimised(ctx); t {
			Emit(GetSingleton().WindowSizeChange, -1)
		}
	}
}
