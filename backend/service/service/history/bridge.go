package history

import (
	"fine/backend/app"
	"fine/backend/constant"
	"fine/backend/database"
	"fine/backend/database/repository"
	"fine/backend/logger"
)

type Bridge struct {
	app         *app.App
	historyRepo repository.HistoryRepository
}

func NewHistoryBridge(app *app.App) *Bridge {
	return &Bridge{
		app:         app,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

func (r *Bridge) FindByPartialKey(ht constant.HistoryType, key string) []string {
	logger.Info(key)
	items, err := r.historyRepo.FindByPartialKey(ht, key, 10)
	if err != nil {
		logger.Info(err.Error())
		return nil
	}
	t := make([]string, 0)
	for _, item := range items {
		t = append(t, item.Key)
	}
	return t
}
