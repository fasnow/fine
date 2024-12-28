package repository

import (
	"fine/backend/database"
	"fine/backend/database/models"
	"gorm.io/gorm"
)

type HunterRestTokenDBService struct {
	dbConn *gorm.DB
}

func NewHunterResidualTokenDBService() *HunterRestTokenDBService {
	return &HunterRestTokenDBService{dbConn: database.GetConnection()}
}

func (h *HunterRestTokenDBService) Add(total int) {
	h.dbConn.Create(&models.HunterRestToken{Total: total})
}

func (h *HunterRestTokenDBService) GetLast() int {
	totalToken := &models.HunterRestToken{}
	h.dbConn.Last(totalToken)
	return totalToken.Total
}
