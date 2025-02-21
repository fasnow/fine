package repository

import (
	"fine/backend/database/models"
	"fine/backend/service/model/fofa"
	"gorm.io/gorm"
)

type FofaRepository interface {
	CreateBulk(pageID int64, items []*fofa.Item) error
	GetBulkByPageID(pageID int64) ([]*models.Fofa, error)
	GetByPaginationAndTaskID(pageID int64, pageNum, pageSize int) ([]*models.Fofa, error)
	CreateQueryField(item *models.FOFAQueryLog) error
	GetQueryFieldByPageID(pageID int64) (*models.FOFAQueryLog, error)
}

type FofaRepositoryImpl struct {
	db *gorm.DB
}

func NewFofaRepository(db *gorm.DB) FofaRepository {
	return &FofaRepositoryImpl{
		db: db,
	}
}

func (r *FofaRepositoryImpl) CreateBulk(pageID int64, items []*fofa.Item) error {
	dbItems := make([]*models.Fofa, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.Fofa{
			Item:   tmp,
			PageID: pageID,
		})
	}
	if err := r.db.Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *FofaRepositoryImpl) GetBulkByPageID(pageID int64) ([]*models.Fofa, error) {
	items := make([]*models.Fofa, 0)
	if err := r.db.Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *FofaRepositoryImpl) GetByPaginationAndTaskID(pageID int64, pageNum, pageSize int) ([]*models.Fofa, error) {
	var offset = (pageNum - 1) * pageSize
	var items = make([]*models.Fofa, 0)
	if err := r.db.Model(&models.Fofa{}).Limit(pageSize).Offset(offset).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *FofaRepositoryImpl) CreateQueryField(item *models.FOFAQueryLog) error {
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *FofaRepositoryImpl) GetQueryFieldByPageID(pageID int64) (*models.FOFAQueryLog, error) {
	item := &models.FOFAQueryLog{}
	if err := r.db.Where("page_id = ?", pageID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
