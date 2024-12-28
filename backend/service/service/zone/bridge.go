package zone

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/logger"
	"fine/backend/service/model/zone"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"math"
	"path/filepath"
	"time"
)

type Bridge struct {
	app         *app.App
	zone        *Zone
	zoneRepo    repository.ZoneRepositoryImpl
	downloadLog *repository.DownloadLogService
	cacheTotal  *repository.CacheTotal
	historyRepo repository.HistoryRepository
}

func NewZoneBridge(app *app.App) *Bridge {
	tt := NewClient(config.GlobalConfig.Zone.Token)
	tt.UseProxyManager(config.ProxyManager)
	return &Bridge{
		zone:        tt,
		zoneRepo:    repository.NewZoneRepository(database.GetConnection()),
		downloadLog: repository.NewDownloadLogService(),
		cacheTotal:  repository.NewCacheTotal(),
		app:         app,
		historyRepo: repository.NewHistoryRepository(database.GetConnection()),
	}
}

func (r *Bridge) SetAuth(key string) error {
	config.GlobalConfig.Zone.Token = key
	if err := config.Save(); err != nil {
		logger.Info(err.Error())
		return err

	}
	r.zone.SetAuth(key)
	return nil
}

type QuerySiteResult struct {
	Result  SiteResult `json:"result"`
	TaskID  int64      `json:"taskID"`
	MaxPage int        `json:"maxPage"`
}

type QueryDomainResult struct {
	Result  DomainResult `json:"result"`
	TaskID  int64        `json:"taskID"`
	MaxPage int          `json:"maxPage"`
}

type QueryApkResult struct {
	Result  ApkResult `json:"result"`
	TaskID  int64     `json:"taskID"`
	MaxPage int       `json:"maxPage"`
}

type QueryMemberResult struct {
	Result  MemberResult `json:"result"`
	TaskID  int64        `json:"taskID"`
	MaxPage int          `json:"maxPage"`
}

type QueryEmailResult struct {
	Result  EmailResult `json:"result"`
	TaskID  int64       `json:"taskID"`
	MaxPage int         `json:"maxPage"`
}

type QueryCodeResult struct {
	Result  CodeResult `json:"result"`
	TaskID  int64      `json:"taskID"`
	MaxPage int        `json:"maxPage"`
}

type QueryDwmResult struct {
	Result  DarknetResult `json:"result"`
	TaskID  int64         `json:"taskID"`
	MaxPage int           `json:"maxPage"`
}

type QueryAimResult struct {
	Result  AimResult `json:"result"`
	TaskID  int64     `json:"taskID"`
	MaxPage int       `json:"maxPage"`
}

func (r *Bridge) QuerySite(taskID int64, query string, page, pageSize int) (*QuerySiteResult, error) {
	queryResult := &QuerySiteResult{
		Result: SiteResult{},
	}
	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Site.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.SiteItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Site.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.SiteType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Site.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryDomain(taskID int64, query string, page, pageSize int) (*QueryDomainResult, error) {
	queryResult := &QueryDomainResult{
		Result: DomainResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Domain.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.DomainItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Domain.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.DomainType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Domain.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryApk(taskID int64, query string, page, pageSize int) (*QueryApkResult, error) {
	queryResult := &QueryApkResult{
		Result: ApkResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Apk.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.ApkItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Apk.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.ApkType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Apk.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryMember(taskID int64, query string, page, pageSize int) (*QueryMemberResult, error) {
	queryResult := &QueryMemberResult{
		Result: MemberResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Member.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.MemberItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Member.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.MemberType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Member.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryEmail(taskID int64, query string, page, pageSize int) (*QueryEmailResult, error) {
	queryResult := &QueryEmailResult{
		Result: EmailResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Email.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.EmailItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Email.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.EmailType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Email.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryCode(taskID int64, query string, page, pageSize int) (*QueryCodeResult, error) {
	queryResult := &QueryCodeResult{
		Result: CodeResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Code.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.CodeItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Code.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.CodeType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Code.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryDwm(taskID int64, query string, page, pageSize int) (*QueryDwmResult, error) {
	queryResult := &QueryDwmResult{
		Result: DarknetResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Dwm.GetBulkByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.DarknetItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.Darknet.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.DarknetType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Dwm.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) QueryAim(taskID int64, query string, page, pageSize int) (*QueryAimResult, error) {
	queryResult := &QueryAimResult{
		Result: AimResult{},
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.zoneRepo.Aim.GetBulkByTaskID(taskID)
		if err != nil {
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.PageNum = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.AimItem)
		}
		return queryResult, nil
	}

	err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: constant.Histories.FOFA,
	})
	if err != nil {
		logger.Info(err)
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := r.zone.AIM.Get(req)
	if err != nil {
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.zoneRepo.CreateQueryField(&models.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.AIMType,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.zoneRepo.Aim.CreateBulk(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (r *Bridge) ExportSite(taskID int64, page int) error {
	zoneRepo, err := r.zoneRepo.GetQueryFieldByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GlobalConfig.Zone.Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(zoneRepo.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := r.zone.Site.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := r.zoneRepo.Site.GetBulkByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*zone.SiteItem, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.SiteItem)
					}
					if err := SiteDataExport(exportItems, outputAbsFilepath); err != nil {
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(interval)
				continue
			}
			_ = r.zoneRepo.Site.CreateBulk(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := r.zoneRepo.Site.GetBulkByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*zone.SiteItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.SiteItem)
		}
		if err := SiteDataExport(exportItems, outputAbsFilepath); err != nil {
			return
		}
		constant.HasNewDownloadLogItemEventEmit(constant.Events.HasNew0zoneSiteDownloadItem)
	}()
	return nil
}

func (r *Bridge) ExportDomain(taskID int64, page int) error {
	zoneRepo, err := r.zoneRepo.GetQueryFieldByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GlobalConfig.Zone.Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(zoneRepo.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := r.zone.Domain.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := r.zoneRepo.Domain.GetBulkByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*zone.DomainItem, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.DomainItem)
					}
					if err := DomainDataExport(exportItems, outputAbsFilepath); err != nil {
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(interval)
				continue
			}
			_ = r.zoneRepo.Domain.CreateBulk(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := r.zoneRepo.Domain.GetBulkByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*zone.DomainItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.DomainItem)
		}
		if err := DomainDataExport(exportItems, outputAbsFilepath); err != nil {
			return
		}
		constant.HasNewDownloadLogItemEventEmit(constant.Events.HasNew0zoneMemberDownloadItem)
	}()
	return nil
}

func (r *Bridge) ExportMember(taskID int64, page int) error {
	zoneRepo, err := r.zoneRepo.GetQueryFieldByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GlobalConfig.Zone.Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(zoneRepo.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := r.zone.Member.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := r.zoneRepo.Member.GetBulkByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*zone.MemberItem, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.MemberItem)
					}
					if err := MemberDataExport(exportItems, outputAbsFilepath); err != nil {
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(interval)
				continue
			}
			_ = r.zoneRepo.Member.CreateBulk(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := r.zoneRepo.Member.GetBulkByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*zone.MemberItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.MemberItem)
		}
		if err := MemberDataExport(exportItems, outputAbsFilepath); err != nil {
			return
		}
		constant.HasNewDownloadLogItemEventEmit(constant.Events.HasNew0zoneMemberDownloadItem)
	}()
	return nil
}

func (r *Bridge) ExportEmail(taskID int64, page int) error {
	zoneRepo, err := r.zoneRepo.GetQueryFieldByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GlobalConfig.DataDir
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(models.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GlobalConfig.Zone.Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(zoneRepo.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := r.zone.Email.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := r.zoneRepo.Email.GetBulkByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*zone.EmailItem, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.EmailItem)
					}
					if err := EmailDataExport(exportItems, outputAbsFilepath); err != nil {
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(interval)
				continue
			}
			_ = r.zoneRepo.Email.CreateBulk(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := r.zoneRepo.Email.GetBulkByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*zone.EmailItem, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.EmailItem)
		}
		if err := EmailDataExport(exportItems, outputAbsFilepath); err != nil {
			return
		}
		constant.HasNewDownloadLogItemEventEmit(constant.Events.HasNew0zoneMemberDownloadItem)
	}()
	return nil
}
