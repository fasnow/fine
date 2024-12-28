package tianyancha

import (
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/logger"
)

type Bridge struct {
	t           *TianYanCha
	historyRepo repository.HistoryRepository
}

func NewTianYanChaBridge() *Bridge {
	tt := NewClient(config.GlobalConfig.TianYanCha.Token)
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		t:           tt,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

func (r *Bridge) SetAuth(token string) error {
	config.GlobalConfig.TianYanCha.Token = token
	if err := config.Save(); err != nil {
		return err
	}
	r.t.SetToken(token)
	return nil
}

func (r *Bridge) Suggest(key string) ([]SuggestItem, error) {
	err := r.historyRepo.CreateHistory(&models.History{Key: key, Type: constant.Histories.TYC})
	if err != nil {
		logger.Info(err)
	}
	return r.t.Suggest(key)
}

func (r *Bridge) GetInvestee(id string) ([]PenetrationItem, error) {
	return r.t.GetInvestee(id)
}

func (r *Bridge) GetHolder(id string) ([]PenetrationItem, error) {
	return r.t.GetHolder(id)
}

func (r *Bridge) SearchCompanyV4() ([]SearchCompanyV4Item, error) {
	return r.t.SearchCompanyV4()
}
