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
	"github.com/cenkalti/backoff/v4"
	"math"
	"time"
)

type Bridge struct {
	app             *application.Application
	aiQiCha         *AiQiCha
	historyRepo     repository.HistoryRepository
	exportLogBridge *exportlog.Bridge
}

func NewBridge(app *application.Application) *Bridge {
	tt := New(app.Config.AiQiCha.Cookie)
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
	r.aiQiCha.SetAuth(cookie)
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
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		total, err2 := backoff.RetryWithData(func() (int64, error) {
			total, _, err2 := r.aiQiCha.GetCopyrightList(pid, 1, 1)
			if err2 != nil {
				r.app.Logger.Error(err2)
				return 0, err2
			}
			return total, nil
		}, service2.GetBackOffWithMaxRetries(10, 3*time.Second, 1))
		if err2 != nil {
			service2.SaveToExcel(err2, exportID, event.AiQiCha, r.app.Logger, func() error {
				return nil
			})
			return
		}
		maxPageNum := int(math.Ceil(float64(total / 10)))
		items := make([]*Copyright, 0)
		for pageNum := 1; pageNum <= maxPageNum; pageNum++ {
			result, err3 := backoff.RetryWithData(func() ([]*Copyright, error) {
				_, list, err3 := r.aiQiCha.GetCopyrightList(pid, pageNum, 10)
				if err3 != nil {
					r.app.Logger.Error(err3)
					return nil, err3
				}
				return list, nil
			}, service2.GetBackOffWithMaxRetries(10, 3*time.Second, 1))
			if err3 != nil {
				break
			}
			items = append(items, result...)
		}
		service2.SaveToExcel(nil, exportID, event.AiQiCha, r.app.Logger, func() error {
			return r.aiQiCha.ExportCopyrights(items, outputAbsFilepath)
		})
	}()
	return exportID, nil
}

func (r *Bridge) ExportAllBranch(pid string) (int64, error) {
	exportID, outputAbsFilepath, err := r.exportLogBridge.Create("AiQiCha")
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		total, err2 := backoff.RetryWithData(func() (int64, error) {
			total, _, err2 := r.aiQiCha.GetBranchList(pid, 1, 1)
			if err2 != nil {
				r.app.Logger.Error(err2)
				return 0, err2
			}
			return total, nil
		}, service2.GetBackOffWithMaxRetries(10, 3*time.Second, 1))
		if err2 != nil {
			service2.SaveToExcel(err2, exportID, event.AiQiCha, r.app.Logger, func() error {
				return nil
			})
			return
		}
		maxPageNum := int(math.Ceil(float64(total / 1000)))
		items := make([]*Branch, 0)
		for pageNum := 1; pageNum <= maxPageNum; pageNum++ {
			result, err3 := backoff.RetryWithData(func() ([]*Branch, error) {
				_, list, err3 := r.aiQiCha.GetBranchList(pid, pageNum, 1000)
				if err3 != nil {
					r.app.Logger.Error(err3)
					return nil, err3
				}
				return list, nil
			}, service2.GetBackOffWithMaxRetries(10, 3*time.Second, 1))
			if err3 != nil {
				break
			}
			items = append(items, result...)
		}
		service2.SaveToExcel(nil, exportID, event.AiQiCha, r.app.Logger, func() error {
			return r.aiQiCha.ExportBranches(items, outputAbsFilepath)
		})
	}()
	return exportID, nil
}
