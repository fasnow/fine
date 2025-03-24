package shodan

import (
	"fine/backend/application"
	"fine/backend/constant/history"
	"fine/backend/database"
	"fine/backend/database/models"
	shodan2 "fine/backend/database/models/shodan"
	"fine/backend/database/repository"
	"fine/backend/service/model/shodan"
	"fine/backend/service/model/shodan/properties"
	"fine/backend/service/service/exportlog"
	"github.com/yitter/idgenerator-go/idgen"
)

type Bridge struct {
	app             *application.Application
	shodan          *Shodan
	historyRepo     repository.HistoryRepository
	cacheTotal      repository.CacheTotal
	exportLogBridge *exportlog.Bridge
	shodanRepo      repository.ShodanRepository
}

func NewBridge(app *application.Application) *Bridge {
	db := database.GetConnection()
	bridge := &Bridge{
		app:             app,
		shodan:          New(app.Config.Shodan.Token),
		cacheTotal:      repository.NewCacheTotal(db),
		historyRepo:     repository.NewHistoryRepository(db),
		exportLogBridge: exportlog.NewBridge(app),
		shodanRepo:      repository.NewShodanRepository(db),
	}
	bridge.shodan.UseProxyManager(app.ProxyManager)
	return bridge
}

func (r *Bridge) GetUserInfo() (*User, error) {
	user, err := r.shodan.User()
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return user, nil
}

func (r *Bridge) SetAuth(key string) error {
	r.app.Config.Shodan.Token = key
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	r.shodan.SetAuth(key)
	return nil
}

type HostSearchResult struct {
	shodan.HostSearchResult
	PageID int64 `json:"pageID"`
}

// GetGeneral wails无法自动暴露至前端，需手动暴露
func (r *Bridge) GetGeneral() *properties.General {
	return nil
}

// GetHTTP wails无法自动暴露至前端，需手动暴露
func (r *Bridge) GetHTTP() *properties.HTTP {
	return nil
}

func (r *Bridge) HostSearch(pageID int64, query string, facets string, pageNum int, minify bool) (*HostSearchResult, error) {
	result := &HostSearchResult{}

	//获取缓存
	total, _ := r.cacheTotal.GetByPageID(pageID)
	if total != 0 {
		pageData, err := r.shodanRepo.GetHostSearchPageData(pageID)
		if err != nil {
			r.app.Logger.Error(err)
			return nil, err
		}
		result.Total = total
		result.Facets = pageData.Facets.Facets
		result.PageID = pageID
		for _, general := range pageData.Matches {
			result.Matches = append(result.Matches, general.General)
		}
		return result, nil
	}

	if err := r.historyRepo.CreateHistory(&models.History{
		Key:  query,
		Type: history.Shodan,
	}); err != nil {
		r.app.Logger.Warn(err)
	}

	//获取新数据
	hostSearchResult, err := r.shodan.HostSearch(query, facets, pageNum, minify)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	tmpPageID := idgen.NextId()
	if hostSearchResult.Total > 0 {
		if pageNum == 1 {
			// 缓存查询成功的条件，用于导出
			if err := r.shodanRepo.CreateQueryField(&shodan2.QueryLog{
				PageID: tmpPageID,
				Query:  query,
				Facets: facets,
				Minify: minify,
			}); err != nil {
				r.app.Logger.Error(err)
			}
		}
		r.cacheTotal.Add(tmpPageID, hostSearchResult.Total, query)
		if err := r.shodanRepo.CreateHostSearchPageData(tmpPageID, hostSearchResult); err != nil {
			r.app.Logger.Error(err)
		}
	}
	result.PageID = tmpPageID
	result.HostSearchResult = *hostSearchResult
	return result, nil
}
