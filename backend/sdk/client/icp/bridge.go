package icp

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/sdk/model/icp"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"math"
	"path/filepath"
	"strconv"
)

type Bridge struct {
	app         *app.App
	icp         *ICP
	queryLog    *service.ICPQueryLog
	downloadLog *service.DownloadLogService
}

func NewICPBridge(app *app.App) *Bridge {
	return &Bridge{
		icp:         NewClient(),
		queryLog:    service.NewICPQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		app:         app,
	}
}

type QueryResult struct {
	*Result
	TaskID  int64 `json:"task_id"`
	MaxPage int   `json:"maxPage"`
}

func (b *Bridge) Query(query string, page, pageSize int) (*QueryResult, error) {
	queryResult := &QueryResult{}
	result, err := b.icp.Page(page).PageSize(pageSize).Query(query)
	if err != nil {
		return nil, err
	}
	if result.Total > 0 {
		// 缓存查询成功的条件，用于导出
		taskID := idgen.NextId()
		queryResult.TaskID = taskID
		_ = b.queryLog.Add(&model.ICPQueryLog{
			UnitName: query,
			Total:    result.Total,
			MaxPage:  int(math.Ceil(float64(result.Total) / float64(pageSize))),
		}, taskID)
	}
	queryResult.Result = result
	return queryResult, nil
}

func (b *Bridge) Export(taskID int64) error {
	queryLog, err := b.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetBaseDataDir()
	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = b.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)

	result, err := b.icp.Page(1).PageSize(queryLog.Total).Query(queryLog.UnitName)
	if err != nil {
		b.downloadLog.UpdateStatus(fileID, -1, err.Error())
		return errors.New(strconv.FormatInt(taskID, 10) + queryLog.UnitName)
	}

	var data [][]any
	headers := append([]any{"id"}, []any{"Domain", "Domain_ID",
		"Leader_Name", "Limit_Access", "Main_ID", "Main_Licence", "Nature_Name", "Service_ID", "Service_Licence",
		"Unit_Name", "UpdateRecord_Time"}...)
	data = append(data, headers)
	for index, item := range result.Items {
		var tmpItem = []any{
			index + 1,
			item.Domain,
			item.DomainID,
			item.LeaderName,
			item.LimitAccess,
			item.MainID,
			item.MainLicence,
			item.NatureName,
			item.ServiceID,
			item.ServiceLicence,
			item.UnitName,
			item.UpdateRecordTime}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, outputAbsFilepath); err != nil {
		b.downloadLog.UpdateStatus(fileID, -1, err.Error())
		return err
	}
	b.downloadLog.UpdateStatus(fileID, 1, "")
	event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNewIcpDownloadItem)
	return nil
}

func (b *Bridge) GetImage() (*icp.Image, error) {
	image, err := b.icp.GetImage()
	if err != nil {
		return nil, err
	}
	return image, nil
}

func (b *Bridge) IsSignExpired() bool {
	return b.icp.IsSignExpired()
}

func (b *Bridge) CheckImage(pointJson string) (*map[string]any, error) {
	sign, smallImage, err := b.icp.CheckImage(pointJson)
	if err != nil {
		return nil, err
	}
	return &map[string]any{
		"sign":       sign,
		"smallImage": smallImage,
	}, nil
}
