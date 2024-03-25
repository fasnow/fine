package ip138

import (
	"fine/backend/app"
	"fine/backend/db/service"
	"fine/backend/logger"
	"fine/backend/proxy"
)

type Bridge struct {
	app         *app.App
	ip138       *IP138
	queryLog    *service.ICPQueryLog
	downloadLog *service.DownloadLogService
}

func NewIP138Bridge(app *app.App) *Bridge {
	tt := NewClient()
	proxy.GetSingleton().Add(tt)
	return &Bridge{
		ip138:       tt,
		queryLog:    service.NewICPQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		app:         app,
	}
}

func (b *Bridge) GetCurrentIP(domain string) (map[string]any, error) {
	items, msg, err := b.ip138.Domain.GetCurrentIP(domain)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}

	return map[string]any{
		"items":   items,
		"message": msg,
	}, nil
}

func (b *Bridge) GetHistoryIP(domain string) ([]*IPItem, error) {
	items, err := b.ip138.Domain.GetHistoryIP(domain)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return items, nil
}

func (b *Bridge) GetCurrentDomain(ip string) ([]*DomainItem, error) {
	items, err := b.ip138.IP.GetCurrentDomain(ip)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return items, nil
}
