package ip138

import (
	"fine/backend/application"
	"fine/backend/database"
	"fine/backend/database/repository"
)

type Bridge struct {
	app           *application.Application
	ip138         *IP138
	exportLogRepo repository.ExportLogRepository
}

func NewBridge(app *application.Application) *Bridge {
	tt := NewClient()
	tt.UseProxyManager(app.ProxyManager)
	db := database.GetConnection()
	return &Bridge{
		ip138:         tt,
		exportLogRepo: repository.NewExportLogRepository(db),
		app:           app,
	}
}

func (r *Bridge) GetCurrentIP(domain string) (map[string]any, error) {
	items, msg, err := r.ip138.Domain.GetCurrentIP(domain)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}

	return map[string]any{
		"items":   items,
		"message": msg,
	}, nil
}

func (r *Bridge) GetHistoryIP(domain string) ([]*IPItem, error) {
	items, err := r.ip138.Domain.GetHistoryIP(domain)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return items, nil
}

func (r *Bridge) GetCurrentDomain(ip string) ([]*DomainItem, error) {
	items, err := r.ip138.IP.GetCurrentDomain(ip)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return items, nil
}
