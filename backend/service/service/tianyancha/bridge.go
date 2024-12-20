package tianyancha

import (
	"fine/backend/config/v2"
)

type Bridge struct {
	t *TianYanCha
}

func NewTianYanChaBridge() *Bridge {
	tt := NewClient(config.GlobalConfig.TianYanCha.Token)
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		t: tt,
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
