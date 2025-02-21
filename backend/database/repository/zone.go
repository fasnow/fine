package repository

import (
	"fine/backend/database/models"
	"fine/backend/service/model/zone"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type siteRepositoryImpl struct{ db *gorm.DB }

type domainRepositoryImpl struct{ db *gorm.DB }

type apkRepositoryImpl struct{ db *gorm.DB }

type memberRepositoryImpl struct{ db *gorm.DB }

type emailRepositoryImpl struct{ db *gorm.DB }

type codeRepositoryImpl struct{ db *gorm.DB }

type dwmRepositoryImpl struct{ db *gorm.DB }

type aimRepositoryImpl struct{ db *gorm.DB }

type baseZoneRepository[T1 any, T2 any] interface {
	CreateBulk(pageID int64, items []T1) error
	GetBulkByTaskID(pageID int64) ([]*T2, error)
}

type zoneSiteRepository interface {
	baseZoneRepository[zone.SiteItem, models.ZoneSite]
}

type zoneSiteRepositoryImpl struct {
}

type zoneDomainRepository interface {
	baseZoneRepository[zone.DomainItem, models.ZoneDomain]
}

type zoneApkRepository interface {
	baseZoneRepository[zone.ApkItem, models.ZoneApk]
}

type zoneMemberRepository interface {
	baseZoneRepository[zone.MemberItem, models.ZoneMember]
}

type zoneEmailRepository interface {
	baseZoneRepository[zone.EmailItem, models.ZoneEmail]
}

type zoneCodeRepository interface {
	baseZoneRepository[zone.CodeItem, models.ZoneCode]
}

type zoneDwmRepository interface {
	baseZoneRepository[zone.DarknetItem, models.ZoneDwm]
}

type zoneAimRepository interface {
	baseZoneRepository[zone.AimItem, models.ZoneAim]
}

type ZoneRepository interface {
	CreateQueryField(item *models.ZoneQueryLog, pageID int64) error
	GetQueryFieldByTaskID(pageID int64) (*models.ZoneQueryLog, error)
}

type ZoneRepositoryImpl struct {
	db     *gorm.DB
	Site   *siteRepositoryImpl
	Domain *domainRepositoryImpl
	Apk    *apkRepositoryImpl
	Member *memberRepositoryImpl
	Email  *emailRepositoryImpl
	Code   *codeRepositoryImpl
	Dwm    *dwmRepositoryImpl
	Aim    *aimRepositoryImpl
}

func NewZoneRepository(db *gorm.DB) ZoneRepositoryImpl {
	return ZoneRepositoryImpl{
		db:     db,
		Site:   &siteRepositoryImpl{db: db},
		Domain: &domainRepositoryImpl{db: db},
		Apk:    &apkRepositoryImpl{db: db},
		Member: &memberRepositoryImpl{db: db},
		Email:  &emailRepositoryImpl{db: db},
		Code:   &codeRepositoryImpl{db: db},
		Dwm:    &dwmRepositoryImpl{db: db},
		Aim:    &aimRepositoryImpl{db: db},
	}
}

func (r *siteRepositoryImpl) CreateBulk(pageID int64, items []zone.SiteItem) error {
	dbItems := make([]*models.ZoneSite, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneSite{
			SiteItem: &tmp,
			PageID:   pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *siteRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneSite, error) {
	items := make([]*models.ZoneSite, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *domainRepositoryImpl) CreateBulk(pageID int64, items []zone.DomainItem) error {
	dbItems := make([]*models.ZoneDomain, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneDomain{
			DomainItem: &tmp,
			PageID:     pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *domainRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneDomain, error) {
	items := make([]*models.ZoneDomain, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *apkRepositoryImpl) CreateBulk(pageID int64, items []zone.ApkItem) error {
	dbItems := make([]*models.ZoneApk, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneApk{
			ApkItem: &tmp,
			PageID:  pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *apkRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneApk, error) {
	items := make([]*models.ZoneApk, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *memberRepositoryImpl) CreateBulk(pageID int64, items []zone.MemberItem) error {
	dbItems := make([]*models.ZoneMember, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneMember{
			MemberItem: &tmp,
			PageID:     pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *memberRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneMember, error) {
	items := make([]*models.ZoneMember, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *emailRepositoryImpl) CreateBulk(pageID int64, items []zone.EmailItem) error {
	dbItems := make([]*models.ZoneEmail, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneEmail{
			EmailItem: &tmp,
			PageID:    pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *emailRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneEmail, error) {
	items := make([]*models.ZoneEmail, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *codeRepositoryImpl) CreateBulk(pageID int64, items []zone.CodeItem) error {
	dbItems := make([]*models.ZoneCode, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneCode{
			CodeItem: &tmp,
			PageID:   pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *codeRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneCode, error) {
	items := make([]*models.ZoneCode, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *dwmRepositoryImpl) CreateBulk(pageID int64, items []zone.DarknetItem) error {
	dbItems := make([]*models.ZoneDwm, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneDwm{
			DarknetItem: &tmp,
			PageID:      pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *dwmRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneDwm, error) {
	items := make([]*models.ZoneDwm, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *aimRepositoryImpl) CreateBulk(pageID int64, items []zone.AimItem) error {
	dbItems := make([]*models.ZoneAim, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ZoneAim{
			AimItem: &tmp,
			PageID:  pageID,
		})
	}
	if err := r.db.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *aimRepositoryImpl) GetBulkByTaskID(pageID int64) ([]*models.ZoneAim, error) {
	items := make([]*models.ZoneAim, 0)
	if err := r.db.Preload(clause.Associations).Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *ZoneRepositoryImpl) CreateQueryField(item *models.ZoneQueryLog, pageID int64) error {
	item.PageID = pageID
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *ZoneRepositoryImpl) GetQueryFieldByTaskID(pageID int64) (*models.ZoneQueryLog, error) {
	item := &models.ZoneQueryLog{}
	if err := r.db.Where("task_id = ?", pageID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
