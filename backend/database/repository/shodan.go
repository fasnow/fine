package repository

import (
	"fine/backend/database/models/shodan"
	shodan2 "fine/backend/service/model/shodan"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ShodanRepository interface {
	CreateHostSearchPageData(pageID int64, data *shodan2.HostSearchResult) error
	GetHostSearchPageData(pageID int64) (*shodan.HostSearchResult, error)
	CreateQueryField(item *shodan.QueryLog) error
	GetQueryFieldByPageID(pageID int64) (*shodan.QueryLog, error)
}

type ShodanRepositoryImpl struct {
	db *gorm.DB
}

func (r *ShodanRepositoryImpl) CreateHostSearchPageData(pageID int64, data *shodan2.HostSearchResult) error {
	var matches []shodan.General
	for _, match := range data.Matches {
		matches = append(matches, shodan.General{
			PageID:  pageID,
			General: match,
		})
	}
	t := &shodan.HostSearchResult{
		PageID:  pageID,
		Matches: matches,
		Facets: shodan.Facets{
			PageID: pageID,
			Facets: data.Facets,
		},
		Total: data.Total,
	}
	if err := r.db.Create(t).Error; err != nil {
		return err
	}
	return nil
}

func (r *ShodanRepositoryImpl) GetHostSearchPageData(pageID int64) (*shodan.HostSearchResult, error) {
	result := &shodan.HostSearchResult{}
	if err := r.db.Preload(clause.Associations).Model(&shodan.HostSearchResult{}).Where("page_id = ?", pageID).Find(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *ShodanRepositoryImpl) CreateQueryField(item *shodan.QueryLog) error {
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *ShodanRepositoryImpl) GetQueryFieldByPageID(pageID int64) (*shodan.QueryLog, error) {
	item := &shodan.QueryLog{}
	if err := r.db.Where("page_id = ?", pageID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}

func NewShodanRepository(db *gorm.DB) ShodanRepository {
	return &ShodanRepositoryImpl{
		db: db,
	}
}
