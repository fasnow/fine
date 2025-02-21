package exportlog

import (
	"fine/backend/application"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/service/model/exportlog"
)

type Bridge struct {
	app           *application.Application
	exportLogRepo repository.ExportLogRepository
}

func NewExportLogBridge(app *application.Application) *Bridge {
	b := &Bridge{
		app:           app,
		exportLogRepo: repository.NewExportLogRepository(database.GetConnection()),
	}
	if err := b.exportLogRepo.MarkRunningAsError(); err != nil {
		app.Logger.Error(err)
	}
	return b
}

func (r *Bridge) FindByExportID(exportID int64) (*models.ExportLog, error) {
	return r.exportLogRepo.FindByExportID(exportID)
}

func (r *Bridge) Update(item exportlog.Item) error {
	logItem, err := r.exportLogRepo.FindByExportID(item.ExportID)
	if err != nil {
		r.app.Logger.Error(err)
		return err
	}
	logItem.Item = item
	if err := r.exportLogRepo.UpdateByExportID(logItem); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return nil
}

func (r *Bridge) MarkAsDeleted(exportID int64) error {
	return r.exportLogRepo.MarkAsDeleted(exportID)
}

func (r *Bridge) MarkAllAsDeleted() error {
	return r.exportLogRepo.MarkAllAsDeleted()
}

func (r *Bridge) DeleteAll() error {
	return r.exportLogRepo.DeleteAll()
}

func (r *Bridge) GetByOffset(offset, limit int) (map[string]any, error) {
	return r.exportLogRepo.GetByOffset(offset, limit)
}
