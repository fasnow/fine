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
	"fine/backend/utils"
	"fmt"
	"strings"
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

type GetCopyrightListResult struct {
	Total int64
	Data  []*Copyright
}

func (r *Bridge) GetCopyrightList(pid string, pageNum int) (*GetCopyrightListResult, error) {
	total, copyrights, err := r.aiQiCha.GetCopyrights(pid, pageNum, 10)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return &GetCopyrightListResult{
		Total: total,
		Data:  copyrights,
	}, nil
}

type GetBranchListResult struct {
	Total int64
	Data  []*Branch
}

func (r *Bridge) GetBranchList(pid string, pageNum int) (*GetBranchListResult, error) {
	total, branches, err := r.aiQiCha.GetBranches(pid, pageNum, 100)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return &GetBranchListResult{
		Total: total,
		Data:  branches,
	}, nil
}

type GetICPListResult struct {
	Total int64
	Data  []*ICP
}

func (r *Bridge) GetICPList(pid string, pageNum int) (*GetICPListResult, error) {
	total, icps, err := r.aiQiCha.GetICPs(pid, pageNum, 100)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return &GetICPListResult{
		Total: total,
		Data:  icps,
	}, nil
}

func (r *Bridge) ExportInvestRecordByDepth(pid string, depth int, minRate, maxRate float64, dataTypes []string) (int64, error) {
	if len(strings.TrimSpace(pid)) == 0 {
		return 0, fmt.Errorf("pid不能为空")
	}
	if minRate == 0 || maxRate == 0 || minRate > maxRate {
		return 0, fmt.Errorf("错误的投资比例范围: %f-%f", minRate, maxRate)
	}
	dataTypes = utils.RemoveEmptyAndDuplicateString(dataTypes)
	exportID, outputAbsFilepath, err := r.exportLogBridge.Create("AiQiCha")
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		var subErr error
		tree, err := r.aiQiCha.GetInvestTree(pid, depth, minRate, maxRate, dataTypes)
		if err != nil {
			r.app.Logger.Error(err)
			if tree != nil {
				subErr = err
				service2.SaveToExcel(nil, subErr, exportID, event.AiQiCha, r.app.Logger, func() error {
					return r.aiQiCha.Export(tree, outputAbsFilepath)
				})
				return
			}
			service2.SaveToExcel(err, nil, exportID, event.AiQiCha, r.app.Logger, nil)
			return
		}
		service2.SaveToExcel(nil, nil, exportID, event.AiQiCha, r.app.Logger, func() error {
			return r.aiQiCha.Export(tree, outputAbsFilepath)
		})
	}()
	return exportID, nil
}
