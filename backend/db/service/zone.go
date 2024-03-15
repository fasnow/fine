package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"fine/backend/service/model/zone"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ZoneDBService struct {
	Site   *site
	Domain *domain
	Apk    *apk
	Member *member
	Email  *email
	Code   *code
	Dwm    *dwm
	Aim    *aim
}
type site struct{ dbConn *gorm.DB }
type domain struct{ dbConn *gorm.DB }
type apk struct{ dbConn *gorm.DB }
type member struct{ dbConn *gorm.DB }
type email struct{ dbConn *gorm.DB }
type code struct{ dbConn *gorm.DB }
type dwm struct{ dbConn *gorm.DB }
type aim struct{ dbConn *gorm.DB }

func NewZoneDBService() *ZoneDBService {
	dbConn := db.GetDBConnect()
	return &ZoneDBService{
		Site:   &site{dbConn: dbConn},
		Domain: &domain{dbConn: dbConn},
		Apk:    &apk{dbConn: dbConn},
		Member: &member{dbConn: dbConn},
		Email:  &email{dbConn: dbConn},
		Code:   &code{dbConn: dbConn},
		Dwm:    &dwm{dbConn: dbConn},
		Aim:    &aim{dbConn: dbConn},
	}
}

func (r *site) BatchInsert(taskID int64, items []zone.SiteItem) error {
	dbItems := make([]*model.ZoneSite, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneSite{
			SiteItem: &tmp,
			TaskID:   taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *site) GetByTaskID(taskID int64) ([]*model.ZoneSite, error) {
	items := make([]*model.ZoneSite, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *domain) BatchInsert(taskID int64, items []zone.DomainItem) error {
	dbItems := make([]*model.ZoneDomain, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneDomain{
			DomainItem: &tmp,
			TaskID:     taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *domain) GetByTaskID(taskID int64) ([]*model.ZoneDomain, error) {
	items := make([]*model.ZoneDomain, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *apk) BatchInsert(taskID int64, items []zone.ApkItem) error {
	dbItems := make([]*model.ZoneApk, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneApk{
			ApkItem: &tmp,
			TaskID:  taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *apk) GetByTaskID(taskID int64) ([]*model.ZoneApk, error) {
	items := make([]*model.ZoneApk, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *member) BatchInsert(taskID int64, items []zone.MemberItem) error {
	dbItems := make([]*model.ZoneMember, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneMember{
			MemberItem: &tmp,
			TaskID:     taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *member) GetByTaskID(taskID int64) ([]*model.ZoneMember, error) {
	items := make([]*model.ZoneMember, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *email) BatchInsert(taskID int64, items []zone.EmailItem) error {
	dbItems := make([]*model.ZoneEmail, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneEmail{
			EmailItem: &tmp,
			TaskID:    taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *email) GetByTaskID(taskID int64) ([]*model.ZoneEmail, error) {
	items := make([]*model.ZoneEmail, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *code) BatchInsert(taskID int64, items []zone.CodeItem) error {
	dbItems := make([]*model.ZoneCode, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneCode{
			CodeItem: &tmp,
			TaskID:   taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *code) GetByTaskID(taskID int64) ([]*model.ZoneCode, error) {
	items := make([]*model.ZoneCode, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *dwm) BatchInsert(taskID int64, items []zone.DarknetItem) error {
	dbItems := make([]*model.ZoneDwm, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneDwm{
			DarknetItem: &tmp,
			TaskID:      taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *dwm) GetByTaskID(taskID int64) ([]*model.ZoneDwm, error) {
	items := make([]*model.ZoneDwm, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}

func (r *aim) BatchInsert(taskID int64, items []zone.AimItem) error {
	dbItems := make([]*model.ZoneAim, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &model.ZoneAim{
			AimItem: &tmp,
			TaskID:  taskID,
		})
	}
	if err := r.dbConn.Preload(clause.Associations).Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *aim) GetByTaskID(taskID int64) ([]*model.ZoneAim, error) {
	items := make([]*model.ZoneAim, 0)
	if err := r.dbConn.Preload(clause.Associations).Where("task_id = ?", taskID).Find(&items).Error; err != nil {
		return items, err
	}
	return items, nil
}
