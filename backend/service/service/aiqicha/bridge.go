package aiqicha

import (
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/history"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	service2 "fine/backend/service/service"
	"fine/backend/service/service/exportlog"
	"math"
)

type Bridge struct {
	app             *application.Application
	aiQiCha         *AiQiCha
	historyRepo     repository.HistoryRepository
	exportLogBridge *exportlog.Bridge
}

func NewAiQiChaBridge(app *application.Application) *Bridge {
	tt := NewClient(app.Config.AiQiCha.Cookie)
	tt.UseProxyManager(app.ProxyManager)
	return &Bridge{
		app:             app,
		aiQiCha:         tt,
		historyRepo:     repository.NewHistoryRepository(database.GetConnection()),
		exportLogBridge: exportlog.NewBridge(app),
	}
}

func (r *Bridge) SetAuth(cookie string) error {
	r.app.Config.AiQiCha.Cookie = cookie
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		return err
	}
	r.aiQiCha.SetToken(cookie)
	return nil
}

func (r *Bridge) Suggest(key string) ([]SuggestItem, error) {
	err := r.historyRepo.CreateHistory(&models.History{Key: key, Type: history.AQC})
	if err != nil {
		r.app.Logger.Error(err)
	}
	return r.aiQiCha.Suggest(key)
}

func (r *Bridge) GetStockChart(pid string) (*Penetration, error) {
	return r.aiQiCha.GetStockChart(pid, "0")
}

func (r *Bridge) GetShareholder(pid string) ([]Shareholder, error) {
	return r.aiQiCha.GetShareholder(pid)
}

func (r *Bridge) GetInvestRecord(pid string) ([]InvestRecord, error) {
	return r.aiQiCha.GetInvestRecord(pid)
}

func (r *Bridge) GetCopyrightList(pid string, pageNum int) (int64, []*Copyright, error) {
	return r.aiQiCha.GetCopyrightList(pid, pageNum, 10) // 最大只支持10
}

func (r *Bridge) GetBranchList(pid string, pageNum int) (int64, []*Branch, error) {
	return r.aiQiCha.GetBranchList(pid, pageNum, 100)
}

func (r *Bridge) ExportAllCopyright(pid string) (int64, error) {
	exportID, outputAbsFilepath, err := r.exportLogBridge.Create("AiQiCha")
	if err != nil {
		return 0, err
	}
	go func() {
		total, _, err := r.aiQiCha.GetCopyrightList(pid, 1, 1)
		if err != nil {
			r.app.Logger.Error(err)
			return
		}
		maxPageNum := int(math.Ceil(float64(total / 10)))
		items := make([]*Copyright, 0)
		for pageNum := 1; pageNum <= maxPageNum; pageNum++ {
			_, list, err := r.aiQiCha.GetCopyrightList(pid, pageNum, 10)
			if err != nil {
				r.app.Logger.Error(err)
				return
			}
			items = append(items, list...)
		}
		service2.SaveToExcel(nil, exportID, event.AiQiCha, r.app.Logger, func() error {
			return r.aiQiCha.ExportCopyrights(items, outputAbsFilepath)
		})
	}()
	return exportID, nil
}
