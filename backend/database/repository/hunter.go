package repository

import (
	"fine/backend/database/models"
	"fine/backend/service/model/hunter"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type HunterRepository interface {
	CreateBulk(pageID int64, items []*hunter.Item) error
	GetBulkByPageID(pageID int64) ([]*models.Hunter, error)
	GetByPaginationAndTaskID(pageID int64, pageNum, pageSize int) ([]*models.Hunter, error)
	CreateQueryField(item *models.HunterQueryLog) error
	GetQueryFieldByTaskID(pageID int64) (*models.HunterQueryLog, error)
	CreateUserInfo(user hunter.User) error
	GetLastUserInfo() (*models.HunterUser, error)
}

type HunterRepositoryImpl struct {
	db *gorm.DB
}

func (r *HunterRepositoryImpl) GetLastUserInfo() (*models.HunterUser, error) {
	var user = &models.HunterUser{}
	if err := r.db.Model(&user).Last(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *HunterRepositoryImpl) CreateUserInfo(user hunter.User) error {
	u := &models.HunterUser{User: user}
	return r.db.Model(&models.HunterUser{}).Create(u).Error
}

func NewHunterRepository(db *gorm.DB) HunterRepository {
	return &HunterRepositoryImpl{
		db: db,
	}
}

func (r *HunterRepositoryImpl) CreateBulk(pageID int64, items []*hunter.Item) error {
	dbItems := make([]*models.Hunter, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.Hunter{
			Item:   tmp,
			PageID: pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *HunterRepositoryImpl) GetBulkByPageID(pageID int64) ([]*models.Hunter, error) {
	items := make([]*models.Hunter, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *HunterRepositoryImpl) GetByPaginationAndTaskID(pageID int64, page, pageSize int) ([]*models.Hunter, error) {
	var offset = (page - 1) * pageSize
	var items = make([]*models.Hunter, 0)
	if err := r.db.Preload(clause.Associations).Model(&models.Hunter{}).Limit(pageSize).Offset(offset).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *HunterRepositoryImpl) CreateQueryField(item *models.HunterQueryLog) error {
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *HunterRepositoryImpl) GetQueryFieldByTaskID(pageID int64) (*models.HunterQueryLog, error) {
	item := &models.HunterQueryLog{}
	if err := r.db.Where("page_id = ?", pageID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
