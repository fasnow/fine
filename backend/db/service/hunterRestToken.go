package service

import (
	"fine/backend/db"
	"fine/backend/db/model"
	"gorm.io/gorm"
)

type HunterRestTokenDBService struct {
	dbConn *gorm.DB
}

func NewHunterResidualTokenDBService() *HunterRestTokenDBService {
	return &HunterRestTokenDBService{dbConn: db.GetDBConnect()}
}

func (h *HunterRestTokenDBService) Add(total int) {
	h.dbConn.Create(&model.HunterRestToken{Total: total})
}

func (h *HunterRestTokenDBService) GetLast() int {
	totalToken := &model.HunterRestToken{}
	h.dbConn.Last(totalToken)
	return totalToken.Total
}
