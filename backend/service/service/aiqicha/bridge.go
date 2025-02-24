package aiqicha

import (
	"fine/backend/application"
	"fine/backend/constant/history"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
)

type Bridge struct {
	app         *application.Application
	aiQiCha     *AiQiCha
	historyRepo repository.HistoryRepository
}

func NewAiQiChaBridge(app *application.Application) *Bridge {
	tt := NewClient(app.Config.AiQiCha.Cookie)
	tt.UseProxyManager(app.ProxyManager)
	return &Bridge{
		app:         app,
		aiQiCha:     tt,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
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
	return r.aiQiCha.GetCopyrightList(pid, pageNum)
}
