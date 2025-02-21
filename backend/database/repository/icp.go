package repository

import (
	"fine/backend/database/models"
	"fine/backend/service/model/icp"
	"fmt"
	"gorm.io/gorm"
)

type IcpRepository interface {
	CreateBulk(pageID int64, items []*icp.Item) error
	GetBulkByPageID(pageID int64) ([]*models.ICP, error)
	GetBulkByPagination(pageNum, pageSize int) ([]*models.ICP, int, error)
	CreateQueryField(item *models.ICPQueryLog) error
	GetQueryFieldByTaskID(pageID int64) (*models.ICPQueryLog, error)
	FindByPartialKey(key string, pageNum, pageSize int) ([]*models.ICP, int, error)
	FindByPartialKeyV2(key string, pageNum, pageSize int) ([]*icp.Item, int, error)
}

type IcpRepositoryImpl struct {
	db *gorm.DB
}

func NewIcpRepository(db *gorm.DB) IcpRepository {
	return &IcpRepositoryImpl{
		db: db,
	}
}

func (r *IcpRepositoryImpl) CreateBulk(pageID int64, items []*icp.Item) error {
	dbItems := make([]*models.ICP, 0)
	for _, item := range items {
		tmp := item
		dbItems = append(dbItems, &models.ICP{
			Item:   tmp,
			PageID: pageID,
		})
	}
	if err := r.db.Create(&dbItems).Error; err != nil {
		return err
	}
	return nil
}

func (r *IcpRepositoryImpl) GetBulkByPageID(pageID int64) ([]*models.ICP, error) {
	items := make([]*models.ICP, 0)
	if err := r.db.Where("page_id = ?", pageID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *IcpRepositoryImpl) GetBulkByPagination(pageNum, pageSize int) ([]*models.ICP, int, error) {
	var offset = (pageNum - 1) * pageSize
	var items = make([]*models.ICP, 0)
	var total int64

	// 先查询总数
	if err := r.db.Model(&models.ICP{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 再查询当前页的数据
	if err := r.db.Model(&models.ICP{}).Limit(pageSize).Offset(offset).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, int(total), nil
}

func (r *IcpRepositoryImpl) CreateQueryField(item *models.ICPQueryLog) error {
	if err := r.db.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (r *IcpRepositoryImpl) GetQueryFieldByTaskID(pageID int64) (*models.ICPQueryLog, error) {
	item := &models.ICPQueryLog{}
	if err := r.db.Where("page_id = ?", pageID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}

func (r *IcpRepositoryImpl) FindByPartialKey(key string, pageNum, pageSize int) ([]*models.ICP, int, error) {
	var offset = (pageNum - 1) * pageSize
	var total int64

	likeValue := "%" + key + "%"

	// 先查询总数
	if err := r.db.Model(&models.ICP{}).
		Where("unit_name LIKE ? OR service_name LIKE ?", likeValue, likeValue).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var items = make([]*models.ICP, 0)
	err := r.db.Model(&models.ICP{}).
		Where("unit_name LIKE ? OR service_name LIKE ?", likeValue, likeValue).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&items).Error
	if err != nil {
		return nil, 0, err
	}

	return items, int(total), nil
}

func (r *IcpRepositoryImpl) FindByPartialKeyV2(key string, pageNum, pageSize int) ([]*icp.Item, int, error) {
	var offset = (pageNum - 1) * pageSize
	var total int64

	likeValue := "%" + key + "%"

	// 先查询总数
	subQuery := fmt.Sprintf(`
        (SELECT service_name, leader_name, nature_name, service_licence, unit_name, update_record_time, service_type, created_at
         FROM icps
         WHERE unit_name LIKE '%s' OR service_name LIKE '%s'
        UNION
        SELECT service_name, leader_name, nature_name, service_licence, unit_name, update_record_time, service_type, created_at
         FROM item_with_ids
         WHERE unit_name LIKE '%s' OR service_name LIKE '%s')
    `, likeValue, likeValue, likeValue, likeValue)

	countQuery := fmt.Sprintf(`
        SELECT COUNT(*)
        FROM (
            SELECT MAX(created_at)
            FROM (%s) AS combined
            GROUP BY service_name, service_type, unit_name
        ) AS grouped
    `, subQuery)

	if err := r.db.Raw(countQuery).Scan(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询分页数据
	var items []*icp.Item
	query := fmt.Sprintf(`
        SELECT combined.*
        FROM (%s) AS combined
        JOIN (
            SELECT service_name, service_type, unit_name, MAX(created_at) as max_created_at
            FROM (%s) AS inner_combined
            GROUP BY service_name, service_type, unit_name
        ) AS grouped ON combined.service_name = grouped.service_name 
                      AND combined.service_type = grouped.service_type 
                      AND combined.unit_name = grouped.unit_name 
                      AND combined.created_at = grouped.max_created_at
        ORDER BY combined.created_at DESC
        LIMIT %d OFFSET %d
    `, subQuery, subQuery, pageSize, offset)

	if err := r.db.Raw(query).Scan(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, int(total), nil
}
