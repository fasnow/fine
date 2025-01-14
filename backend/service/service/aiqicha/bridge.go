package aiqicha

import (
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/logger"
)

type Bridge struct {
	aiQiCha     *AiQiCha
	historyRepo repository.HistoryRepository
}

func NewAiQiChaBridge() *Bridge {
	tt := NewClient(config.GlobalConfig.AiQiCha.Cookie)
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		aiQiCha:     tt,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

func (r *Bridge) SetAuth(cookie string) error {
	config.GlobalConfig.AiQiCha.Cookie = cookie
	if err := config.Save(); err != nil {
		return err
	}
	r.aiQiCha.SetToken(cookie)
	return nil
}

func (r *Bridge) Suggest(key string) ([]SuggestItem, error) {
	err := r.historyRepo.CreateHistory(&models.History{Key: key, Type: constant.Histories.TYC})
	if err != nil {
		logger.Info(err)
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
