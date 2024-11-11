package service

import (
	"fine/backend/db"
	"fine/backend/db/models"
	"fine/backend/logger"
	"gorm.io/gorm"
)

type ICPQueryLog struct {
	dbConn *gorm.DB
}

func NewICPQueryLog() *ICPQueryLog {
	return &ICPQueryLog{
		dbConn: db.GetDBConnect()}
}

func (q *ICPQueryLog) Add(item *models.ICPQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := q.dbConn.Create(item).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (q *ICPQueryLog) GetByTaskID(taskID int64) (*models.ICPQueryLog, error) {
	item := &models.ICPQueryLog{}
	if err := q.dbConn.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return item, nil
}

type FOFAQueryLog struct {
	dbConn *gorm.DB
}

func NewFOFAQueryLog() *FOFAQueryLog {
	return &FOFAQueryLog{
		dbConn: db.GetDBConnect()}
}

func (q *FOFAQueryLog) Add(item *models.FOFAQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := q.dbConn.Create(item).Error; err != nil {
		logger.Info(err.Error())
		return err
	}
	return nil
}

func (q *FOFAQueryLog) GetByTaskID(taskID int64) (*models.FOFAQueryLog, error) {
	item := &models.FOFAQueryLog{}
	if err := q.dbConn.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	return item, nil
}

type HunterQueryLog struct {
	dbConn *gorm.DB
}

func NewHunterQueryLog() *HunterQueryLog {
	return &HunterQueryLog{
		dbConn: db.GetDBConnect()}
}

func (q *HunterQueryLog) Add(item *models.HunterQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := q.dbConn.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (q *HunterQueryLog) GetByTaskID(taskID int64) (*models.HunterQueryLog, error) {
	item := &models.HunterQueryLog{}
	if err := q.dbConn.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}

type CacheTotal struct {
	dbConn *gorm.DB
}

func NewCacheTotal() *CacheTotal {
	return &CacheTotal{
		dbConn: db.GetDBConnect()}
}

func (c *CacheTotal) Add(taskID, total int64, query string) {
	c.dbConn.Create(&models.CacheTotal{TaskID: taskID, Total: total, Query: query})
}

func (c *CacheTotal) GetByTaskID(taskID int64) (int64, string) {
	cacheTotal := &models.CacheTotal{}
	c.dbConn.Where("task_id = ?", taskID).Find(cacheTotal)
	return cacheTotal.Total, cacheTotal.Query
}

type QuakeQueryLog struct {
	dbConn *gorm.DB
}

func NewQuakeQueryLog() *QuakeQueryLog {
	return &QuakeQueryLog{
		dbConn: db.GetDBConnect(),
	}
}

func (q *QuakeQueryLog) Add(item *models.QuakeRealtimeQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := q.dbConn.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (q *QuakeQueryLog) GetByTaskID(taskID int64) (*models.QuakeRealtimeQueryLog, error) {
	item := &models.QuakeRealtimeQueryLog{}
	if err := q.dbConn.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}

type ZoneQueryLog struct {
	dbConn *gorm.DB
}

func NewZoneQueryLog() *ZoneQueryLog {
	return &ZoneQueryLog{
		dbConn: db.GetDBConnect(),
	}
}

func (q *ZoneQueryLog) Add(item *models.ZoneQueryLog, taskID int64) error {
	item.TaskID = taskID
	if err := q.dbConn.Create(item).Error; err != nil {
		return err
	}
	return nil
}

func (q *ZoneQueryLog) GetByTaskID(taskID int64) (*models.ZoneQueryLog, error) {
	item := &models.ZoneQueryLog{}
	if err := q.dbConn.Where("task_id = ?", taskID).Find(item).Error; err != nil {
		return nil, err
	}
	return item, nil
}
