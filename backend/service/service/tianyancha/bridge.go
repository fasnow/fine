package tianyancha

import (
	"fine/backend/application"
	"fine/backend/constant/history"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
)

type Bridge struct {
	t           *TianYanCha
	app         *application.Application
	historyRepo repository.HistoryRepository
}

func NewTianYanChaBridge(app *application.Application) *Bridge {
	tt := NewClient(app.Config.TianYanCha.Token)
	tt.UseProxyManager(app.ProxyManager)
	return &Bridge{
		t:           tt,
		app:         app,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

func (r *Bridge) SetAuth(token string) error {
	r.app.Config.TianYanCha.Token = token
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		return err
	}
	r.t.SetToken(token)
	return nil
}

func (r *Bridge) Suggest(key string) ([]SuggestItem, error) {
	err := r.historyRepo.CreateHistory(&models.History{Key: key, Type: history.TYC})
	if err != nil {
		r.app.Logger.Error(err)
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
