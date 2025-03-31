package service

import (
	"fine/backend/constant/event"
	"fine/backend/constant/status"
	"fine/backend/database"
	"fine/backend/database/repository"
	"github.com/cenkalti/backoff/v4"
	"github.com/sirupsen/logrus"
	"time"
)

// GetBackOffWithMaxRetries interval:间隔 multiplier:延迟递增倍数,1表示不递增 max:最大重试次数
func GetBackOffWithMaxRetries(max uint64, interval time.Duration, multiplier float64) backoff.BackOff {
	bf := backoff.NewExponentialBackOff()
	bf.InitialInterval = interval
	bf.Multiplier = multiplier
	return backoff.WithMaxRetries(bf, max)
}

func SaveToExcel(getDataErr, subErr error, exportID int64, eventName string, logger *logrus.Logger, exportFunc func() error) {
	exportLogRepo := repository.NewExportLogRepository(database.GetConnection())
	data := event.EventDetail{
		ID: exportID,
	}
	exportLog, err := exportLogRepo.FindByExportID(exportID)
	if err != nil {
		data.Status = status.Error
		data.Error = err.Error()
		logger.Error(err, data)
		event.EmitNewExportItemEvent(eventName, data)
		return
	}
	if getDataErr != nil {
		exportLog.Status = status.Error
		exportLog.Error = getDataErr.Error()
		data.Status = status.Error
		data.Error = getDataErr.Error()
		logger.Error(getDataErr, data)
		event.EmitNewExportItemEvent(eventName, data)
		return
	}
	if err := exportFunc(); err != nil {
		exportLog.Status = status.Error
		exportLog.Error = err.Error()
		data.Status = status.Error
		data.Error = err.Error()
		logger.Error(err, data)
		if err2 := exportLogRepo.UpdateByExportID(exportLog); err2 != nil {
			logger.Error(err2, data)
			event.EmitNewExportItemEvent(eventName, data)
			return
		}
		event.EmitNewExportItemEvent(eventName, data)
		return
	}
	exportLog.Status = status.Stopped
	data.Status = status.Stopped
	if subErr != nil {
		exportLog.Error = subErr.Error()
	}
	if err3 := exportLogRepo.UpdateByExportID(exportLog); err3 != nil {
		exportLog.Status = status.Error
		exportLog.Error = err3.Error()
		data.Status = status.Error
		data.Error = err3.Error()
		logger.Error(err3, data)
		event.EmitNewExportItemEvent(eventName, data)
		return
	}
	event.EmitNewExportItemEvent(eventName, data)
}
