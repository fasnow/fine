package zone

import (
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/proxy"
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
	queryLog    *service.ZoneQueryLog
	downloadLog *service.DownloadLogService
	dataCache   *service.ZoneDBService
	cacheTotal  *service.CacheTotal
}

func NewZoneBridge(app *app.App) *Bridge {
	tt := NewClient(config.Get0zone().Token)
	proxy.GetSingleton().Add(tt)
	return &Bridge{
		zone:        tt,
		queryLog:    service.NewZoneQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		dataCache:   service.NewZoneDBService(),
		cacheTotal:  service.NewCacheTotal(),
		app:         app,
	}
}

func (b *Bridge) SetAuth(key string) error {
	t := config.Get0zone()
	t.Token = key
	if err := config.GetSingleton().Save0zone(t); err != nil {
		logger.Info(err.Error())
		return err

	}
	b.zone.SetAuth(key)
	return nil
}

type QuerySiteResult struct {
	Result  SiteResult `json:"result"`
	TaskID  int64      `json:"id"`
	MaxPage int        `json:"maxPage"`
}

type QueryDomainResult struct {
	Result  DomainResult `json:"result"`
	TaskID  int64        `json:"id"`
	MaxPage int          `json:"maxPage"`
}

type QueryApkResult struct {
	Result  ApkResult `json:"result"`
	TaskID  int64     `json:"id"`
	MaxPage int       `json:"maxPage"`
}

type QueryMemberResult struct {
	Result  MemberResult `json:"result"`
	TaskID  int64        `json:"id"`
	MaxPage int          `json:"maxPage"`
}

type QueryEmailResult struct {
	Result  EmailResult `json:"result"`
	TaskID  int64       `json:"id"`
	MaxPage int         `json:"maxPage"`
}

type QueryCodeResult struct {
	Result  CodeResult `json:"result"`
	TaskID  int64      `json:"id"`
	MaxPage int        `json:"maxPage"`
}

type QueryDwmResult struct {
	Result  DarknetResult `json:"result"`
	TaskID  int64         `json:"id"`
	MaxPage int           `json:"maxPage"`
}

type QueryAimResult struct {
	Result  AimResult `json:"result"`
	TaskID  int64     `json:"id"`
	MaxPage int       `json:"maxPage"`
}

func (b *Bridge) QuerySite(taskID int64, query string, page, pageSize int) (*QuerySiteResult, error) {
	queryResult := &QuerySiteResult{
		Result: SiteResult{},
	}
	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Site.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.SiteItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Site.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.SiteType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Site.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryDomain(taskID int64, query string, page, pageSize int) (*QueryDomainResult, error) {
	queryResult := &QueryDomainResult{
		Result: DomainResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Domain.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.DomainItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Domain.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.DomainType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Domain.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryApk(taskID int64, query string, page, pageSize int) (*QueryApkResult, error) {
	queryResult := &QueryApkResult{
		Result: ApkResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Apk.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.ApkItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Apk.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.ApkType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Apk.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryMember(taskID int64, query string, page, pageSize int) (*QueryMemberResult, error) {
	queryResult := &QueryMemberResult{
		Result: MemberResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Member.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.MemberItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Member.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.MemberType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Member.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryEmail(taskID int64, query string, page, pageSize int) (*QueryEmailResult, error) {
	queryResult := &QueryEmailResult{
		Result: EmailResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Email.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.EmailItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Email.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.EmailType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Email.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryCode(taskID int64, query string, page, pageSize int) (*QueryCodeResult, error) {
	queryResult := &QueryCodeResult{
		Result: CodeResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Code.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.CodeItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Code.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.CodeType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Code.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryDwm(taskID int64, query string, page, pageSize int) (*QueryDwmResult, error) {
	queryResult := &QueryDwmResult{
		Result: DarknetResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Dwm.GetByTaskID(taskID)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.DarknetItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.Darknet.Get(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.DarknetType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Dwm.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) QueryAim(taskID int64, query string, page, pageSize int) (*QueryAimResult, error) {
	queryResult := &QueryAimResult{
		Result: AimResult{},
	}

	//获取缓存
	total, _ := b.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := b.dataCache.Aim.GetByTaskID(taskID)
		if err != nil {
			return nil, err
		}
		queryResult.Result.Total = total
		queryResult.Result.Page = page
		queryResult.Result.PageSize = pageSize
		queryResult.TaskID = taskID
		queryResult.MaxPage = int(math.Ceil(float64(total) / float64(pageSize)))
		for _, cacheItem := range cacheItems {
			queryResult.Result.Items = append(queryResult.Result.Items, *cacheItem.AimItem)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().Query(query).Page(page).Size(pageSize).Build()
	result, err := b.zone.AIM.Get(req)
	if err != nil {
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = b.queryLog.Add(&model.ZoneQueryLog{
				Query:     query,
				Page:      page,
				PageSize:  pageSize,
				QueryType: zone.AIMType,
			}, id)
		}
		b.cacheTotal.Add(id, result.Total, query)
		_ = b.dataCache.Aim.BatchInsert(id, result.Items)
		queryResult.TaskID = id
		queryResult.MaxPage = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}
	queryResult.Result = *result
	return queryResult, nil
}

func (b *Bridge) ExportSite(taskID int64, page int) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.Get0zone().Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := b.zone.Site.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := b.dataCache.Site.GetByTaskID(exportDataTaskID)
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
			_ = b.dataCache.Site.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := b.dataCache.Site.GetByTaskID(exportDataTaskID)
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
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNew0zoneSiteDownloadItem)
	}()
	return nil
}

func (b *Bridge) ExportDomain(taskID int64, page int) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.Get0zone().Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := b.zone.Domain.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := b.dataCache.Domain.GetByTaskID(exportDataTaskID)
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
			_ = b.dataCache.Domain.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := b.dataCache.Domain.GetByTaskID(exportDataTaskID)
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
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNew0zoneMemberDownloadItem)
	}()
	return nil
}

func (b *Bridge) ExportMember(taskID int64, page int) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.Get0zone().Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := b.zone.Member.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := b.dataCache.Member.GetByTaskID(exportDataTaskID)
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
			_ = b.dataCache.Member.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := b.dataCache.Member.GetByTaskID(exportDataTaskID)
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
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNew0zoneMemberDownloadItem)
	}()
	return nil
}

func (b *Bridge) ExportEmail(taskID int64, page int) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetDataDir()
	filename := fmt.Sprintf("0.zone_%s.xlsx", utils.GenFilenameTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.Get0zone().Interval
		for index := 1; index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(40).
				Build()
			result, err2 := b.zone.Email.Get(req)
			if err2 != nil {
				if retry == 0 {
					cacheItems, err := b.dataCache.Email.GetByTaskID(exportDataTaskID)
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
			_ = b.dataCache.Email.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(interval)
		}

		cacheItems, err := b.dataCache.Email.GetByTaskID(exportDataTaskID)
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
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNew0zoneMemberDownloadItem)
	}()
	return nil
}
