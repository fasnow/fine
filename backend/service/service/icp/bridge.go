package icp

import (
	ctx "context"
	"fine/backend/application"
	"fine/backend/config"
	"fine/backend/constant/event"
	"fine/backend/constant/history"
	"fine/backend/constant/status"
	"fine/backend/context"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/proxy/v2"
	"fine/backend/service/model/exportlog"
	"fine/backend/service/model/icp"
	service2 "fine/backend/service/service"
	"fine/backend/utils"
	"fmt"
	"github.com/cenkalti/backoff/v4"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type TaskState struct {
	task          *models.ICPTask
	ctx           *context.StatusContext
	mutex         sync.Mutex
	baseTimeSpent float64
	startTime     time.Time
	ticker        *time.Ticker
	resultChan    chan *models.ICPTaskSlice
}

type Bridge struct {
	app           *application.Application
	icp           *ICP
	exportLogRepo repository.ExportLogRepository
	icpRepo       repository.IcpRepository
	icpTaskRepo   repository.IcpTaskRepository
	historyRepo   repository.HistoryRepository
	cacheTotal    repository.CacheTotal
	mutex         sync.Mutex
	taskState     map[int64]*TaskState
}

func NewICPBridge(app *application.Application) *Bridge {
	db := database.GetConnection()
	bridgeClient := &Bridge{
		app:           app,
		exportLogRepo: repository.NewExportLogRepository(db),
		icpRepo:       repository.NewIcpRepository(db),
		icpTaskRepo:   repository.NewIcpTaskRepository(db),
		historyRepo:   repository.NewHistoryRepository(db),
		cacheTotal:    repository.NewCacheTotal(db),
		taskState:     map[int64]*TaskState{},
	}
	icpClient := NewClient()
	bridgeClient.icp = icpClient
	if err := bridgeClient.SetProxy(app.Config.ICP.Proxy); err != nil {
		app.Logger.Error(err)
	}
	_ = bridgeClient.icpTaskRepo.UpdateAllTaskToPaused()
	return bridgeClient
}

// GetItem 只是为了向前端暴露Item结构体
func (r *Bridge) GetItem() *icp.Item {
	return nil
}

type Data struct {
	PageID int64 `json:"pageID"`
	Result
}

func (r *Bridge) Query(pageID int64, query string, pageNum, pageSize int, serviceType string) (*Data, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID":      pageID,
		"query":       query,
		"pageNum":     pageNum,
		"pageSize":    pageSize,
		"serviceType": serviceType,
	}).Debug()

	if err := r.historyRepo.CreateHistory(&models.History{Key: query, Type: history.ICP}); err != nil {
		r.app.Logger.Warn(err.Error())
	}

	queryResult := &Data{}

	if serviceType == "0" {
		items, total, err := r.icpRepo.FindByPartialKeyV2(query, pageNum, pageSize)
		if err != nil {
			r.app.Logger.Error(err)
			return nil, err
		}
		queryResult.Total = total
		queryResult.PageNum = pageNum
		queryResult.PageSize = pageSize
		for _, item := range items {
			queryResult.Items = append(queryResult.Items, item)
		}
		return queryResult, err
	}

	//获取缓存
	total, _ := r.cacheTotal.GetByPageID(pageID)
	if total != 0 {
		cacheItems, err := r.icpRepo.GetBulkByPageID(pageID)
		if err != nil {
			r.app.Logger.Error(err)
			return nil, err
		}
		queryResult.Total = int(total)
		queryResult.PageNum = pageNum
		queryResult.PageSize = pageSize
		queryResult.PageID = pageID
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
	}

	result, err := r.query(pageNum, pageSize, serviceType, query, r.app.Config.ICP.AuthErrorRetryNum1, r.app.Config.ICP.ForbiddenErrorRetryNum1)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	tmpPageID := idgen.NextId()
	if result.Total > 0 {
		if pageNum == 1 { //用于导出
			if err := r.icpRepo.CreateQueryField(&models.ICPQueryLog{
				PageID:      tmpPageID,
				UnitName:    query,
				ServiceType: serviceType,
				Total:       result.Total,
			}); err != nil {
				r.app.Logger.Warn(err)
			}
		}
		r.cacheTotal.Add(tmpPageID, int64(result.Total), query)
		if err := r.icpRepo.CreateBulk(tmpPageID, result.Items); err != nil {
			r.app.Logger.Warn(err)
		}
	}
	return &Data{
		PageID: tmpPageID,
		Result: Result{Items: result.Items, PageSize: result.PageSize, PageNum: result.PageNum, Total: result.Total},
	}, nil
}

func (r *Bridge) query(pageNum, pageSize int, serviceType string, query string, authErrorRetryNum, forbiddenErrorRetryNum uint64) (*Result, error) {
	ctx, cancel := ctx.WithCancel(ctx.Background())
	var err1 error
	result, _ := backoff.RetryWithData(func() (*Result, error) {
		if result, err3 := r.icp.PageNum(pageNum).PageSize(pageSize).ServiceType(serviceType).Query(query); err3 != nil {
			err1 = err3
			// 认证错误
			if err3.Error() == IllegalRequestError.Error() || err3.Error() == CaptchaMismatchError.Error() || err3.Error() == TokenExpiredError.Error() {
				if err4 := backoff.Retry(func() error {
					if err5 := r.icp.SetTokenFromRemote(); err5 != nil {
						return err5 // 触发重试
					}
					return nil
				}, backoff.WithMaxRetries(backoff.NewExponentialBackOff(), authErrorRetryNum)); err4 != nil {
					// 无法更新token,不执行后续查询
					cancel()
					err1 = err4
					return nil, err4 // 这里只需要返回一个错误即可,最终收到的都是ctxCancelError
				}
				// 更新token,后续流程继续
				return nil, err3 // 触发重试
			}

			// 403 错误
			if err3.Error() == "403 Forbidden" {
				return nil, err3 // 触发重试
			}

			// 非预期错误,不重试查询
			cancel()
			return nil, err3
		} else {
			err1 = nil
			return result, nil
		}
	}, backoff.WithContext(backoff.WithMaxRetries(backoff.NewExponentialBackOff(), forbiddenErrorRetryNum), ctx))
	if err1 != nil {
		return nil, err1
	}
	return result, nil
}

func (r *Bridge) ExportCache(key string, total int) (int64, error) {
	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenFilenameTimestamp())
	dir := r.app.Config.ExportDataDir
	exportID := idgen.NextId()
	outputAbsFilepath := filepath.Join(dir, filename)
	if err := r.exportLogRepo.Create(&models.ExportLog{
		Item: exportlog.Item{
			Dir:      dir,
			Filename: filename,
			Status:   status.Running,
			ExportID: exportID,
		},
	}); err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		items, _, err := r.icpRepo.FindByPartialKeyV2(key, 1, total)
		service2.SaveToExcel(err, r.exportLogRepo, exportID, event.ICPExport, r.app.Logger, func() error {
			return r.icp.Export(items, outputAbsFilepath)
		})
	}()
	return exportID, nil
}

func (r *Bridge) Export(pageID int64) (int64, error) {
	r.app.Logger.WithFields(map[string]interface{}{
		"pageID": pageID,
	}).Debug("传入参数")
	queryLog, err := r.icpRepo.GetQueryFieldByTaskID(pageID)
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	r.app.Logger.Info(queryLog)
	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenFilenameTimestamp())
	dir := r.app.Config.ExportDataDir
	exportID := idgen.NextId()
	outputAbsFilepath := filepath.Join(dir, filename)
	if err := r.exportLogRepo.Create(&models.ExportLog{
		Item: exportlog.Item{
			Dir:      dir,
			Filename: filename,
			Status:   status.Running,
			ExportID: exportID,
		},
	}); err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	ctx, cancel := ctx.WithCancel(ctx.Background())
	var err1 error
	go func() {
		result, _ := backoff.RetryWithData(func() (*Result, error) {
			if result, err3 := r.icp.PageNum(1).PageSize(queryLog.Total).ServiceType(queryLog.ServiceType).Query(queryLog.UnitName); err3 != nil {
				if err3.Error() == IllegalRequestError.Error() || err3.Error() == CaptchaMismatchError.Error() || err3.Error() == TokenExpiredError.Error() {
					if err4 := backoff.Retry(func() error {
						if err5 := r.icp.SetTokenFromRemote(); err5 != nil {
							return err5 // 触发重试,重新获取token
						}
						return nil
					}, backoff.WithMaxRetries(backoff.NewExponentialBackOff(), 3)); err4 != nil {
						// 无法更新token,后续流程不再继续
						cancel()
						err1 = err4
						return nil, err4 // 这里只需要返回一个错误即可,最终收到的都是ctxCancelError
					}
					// 更新token,后续流程继续
					return nil, err3 // 触发重试
				}

				// 非预期错误,后续流程不再继续
				cancel()
				err1 = err3
				return nil, err3
			} else {
				return result, nil
			}
		}, backoff.WithContext(backoff.WithMaxRetries(backoff.NewExponentialBackOff(), 3), ctx))
		service2.SaveToExcel(err1, r.exportLogRepo, exportID, event.ICPExport, r.app.Logger, func() error {
			return r.icp.Export(result.Items, outputAbsFilepath)
		})
	}()

	return exportID, nil
}

func (r *Bridge) queryAll(serviceType, query string) (*Result, error) {
	result, err := r.query(1, 1, serviceType, query, r.app.Config.ICP.AuthErrorRetryNum2, r.app.Config.ICP.ForbiddenErrorRetryNum2)
	if err != nil {
		return nil, err
	}
	if result.Total == 1 { // 只有一条就返回当前的就行
		return result, nil
	}
	result2, err := r.query(1, result.Total, serviceType, query, r.app.Config.ICP.AuthErrorRetryNum2, r.app.Config.ICP.ForbiddenErrorRetryNum2)
	if err != nil {
		return nil, err
	}
	return result2, nil
}

func (r *Bridge) SetProxy(p config.Proxy) error {
	if r.app.Config.ICP.Proxy != p {
		r.app.Config.ICP.Proxy.Type = p.Type
		r.app.Config.ICP.Proxy.Enable = p.Enable
		r.app.Config.ICP.Proxy.Host = p.Host
		r.app.Config.ICP.Proxy.Port = p.Port
		r.app.Config.ICP.Proxy.User = p.User
		r.app.Config.ICP.Proxy.Pass = p.Pass
		if err := r.app.WriteConfig(r.app.Config); err != nil {
			msg := "can't save proxy"
			r.app.Logger.Info(msg)
			return errors.New(msg)
		}
	}
	if p.Enable {
		var pm = proxy.NewManager()
		r.icp.UseProxyManager(pm)
		pm.SetTimeout(r.app.Config.ICP.Timeout)
		if p.User != "" {
			auth := p.User
			if p.Pass != "" {
				auth += ":" + p.Pass + "@"
				if err := pm.SetProxy(fmt.Sprintf("%s://%s%s:%s", p.Type, auth, p.Host, p.Port)); err != nil {
					r.app.Logger.Error(err)
					return err
				}

				r.app.Logger.Info("icp proxy enabled on " + pm.ProxyString())
				return nil
			}
		}
		if err := pm.SetProxy(fmt.Sprintf("%s://%s:%s", p.Type, p.Host, p.Port)); err != nil {
			r.app.Logger.Error(err)
			return err
		}
		r.app.Logger.Info("icp proxy enabled on " + pm.ProxyString())
		return nil
	}
	r.icp.UseProxyManager(r.app.ProxyManager)
	r.app.Logger.Info("icp proxy disabled")
	return nil
}

func (r *Bridge) SetProxyTimeout(timeout time.Duration) error {
	r.app.Config.ICP.Timeout = timeout
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		msg := "can't save proxy timeout"
		r.app.Logger.Info(msg)
		return errors.New(msg)
	}
	return r.SetProxy(r.app.Config.ICP.Proxy)
}

type GetTaskListResult struct {
	Total int
	Items []*icp.Task
}

func (r *Bridge) taskExecute(ts *TaskState) {
	go r.taskMonitor(ts)
	go r.taskProcessSlices(ts)
}

func (r *Bridge) taskInitState(taskID int64, resetTask bool) (*TaskState, error) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	task, err := r.icpTaskRepo.GetByTaskID(taskID, false)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	if ts, exists := r.taskState[taskID]; exists {
		select {
		case <-ts.ctx.Running():
			return nil, errors.New("任务已在运行中")
		case <-ts.ctx.Pausing():
			return nil, errors.New("任务正在暂停中，稍后重试")
		default:

		}
	}
	if resetTask {
		if err := r.icpTaskRepo.ResetTask(taskID); err != nil {
			return nil, err
		}
	}
	task, err = r.icpTaskRepo.GetByTaskID(taskID, false)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	sCtx := context.NewStatusContext()
	t := &TaskState{
		task:          task,
		ctx:           sCtx,
		baseTimeSpent: task.TimeSpent,
		ticker:        time.NewTicker(5 * time.Second),
		startTime:     time.Now(),
		resultChan:    make(chan *models.ICPTaskSlice, 1),
	}
	r.taskState[taskID] = t
	return t, nil
}

func (r *Bridge) taskUpdateProgress(ts *TaskState, stat int, delta int64) error {
	ts.mutex.Lock()
	defer ts.mutex.Unlock()
	var errMsg string
	if stat == status.Error {
		if ts.ctx.Err != nil {
			errMsg = ts.ctx.Err.Error()
		} else {
			errMsg = ""
		}
	}
	ts.task.Status = stat
	ts.task.Message = errMsg
	ts.task.TimeSpent = time.Since(ts.startTime).Seconds() + ts.baseTimeSpent
	ts.task.Current += delta
	event.EmitV2(event.ICPBatchQueryStatusUpdate, event.EventDetail{
		ID:     ts.task.TaskID,
		Status: stat,
		Data:   ts.task.Task,
		Error:  errMsg,
	})
	return r.icpTaskRepo.Update(ts.task)
}

func (r *Bridge) taskTicker(ts *TaskState) error {
	ts.mutex.Lock()
	defer ts.mutex.Unlock()
	ts.task.Task.TimeSpent = time.Since(ts.startTime).Seconds() + ts.baseTimeSpent
	event.EmitV2(event.ICPBatchQueryStatusUpdate, event.EventDetail{
		ID:     ts.task.TaskID,
		Status: status.Running,
		Data:   ts.task.Task,
	})
	return r.icpTaskRepo.Update(ts.task)
}

func (r *Bridge) taskProcessSlices(ts *TaskState) {
	ts.ctx.SendRunning()
	var wg sync.WaitGroup
	sem := make(chan struct{}, r.app.Config.ICP.Concurrency) // 控制并发数
	// TODO 不一次性取出
	slices, _ := r.icpTaskRepo.GetSliceByTaskID(ts.task.TaskID)
	for _, slice := range slices {
		if slice.Status == status.Stopped {
			continue
		}
		select {
		case sem <- struct{}{}:
			wg.Add(1)
			select {
			case <-ts.ctx.Running():
				go func(s *models.ICPTaskSlice) {
					defer func() {
						<-sem
						wg.Done()
					}()
					result, err := r.queryAll(s.ServiceType, s.UnitToQuery)
					if err != nil {
						ts.ctx.SendError(err)
						return
					}
					select {
					case <-ts.ctx.Running():
						for _, item := range result.Items {
							s.Items = append(s.Items, &models.ItemWithID{TaskID: ts.task.TaskID, Item: item})
						}
						s.Status = status.Stopped
						ts.resultChan <- s
					default:
					}
				}(slice)
			case <-ts.ctx.Pausing():
				ts.ctx.SendPause()
			default:
			}
		}
	}
	wg.Wait()
	select {
	case <-ts.ctx.Running():
		ts.ctx.SendStop()
	case <-ts.ctx.Pausing():
		ts.ctx.SendPause()
	default:
	}
	ts.ticker.Stop()
}

func (r *Bridge) taskMonitor(ts *TaskState) {
	for {
		select {
		case <-ts.ctx.Done():
			return
		case <-ts.ctx.Error():
			if err := r.taskUpdateProgress(ts, status.Error, 0); err != nil {
				r.app.Logger.Error(err)
			}
			return
		case <-ts.ctx.Stop():
			if err := r.taskUpdateProgress(ts, status.Stopped, 0); err != nil {
				r.app.Logger.Error(err)
			}
			return
		case <-ts.ctx.Paused():
			if err := r.taskUpdateProgress(ts, status.Paused, 0); err != nil {
				r.app.Logger.Error(err)
			}
			return
		case <-ts.ctx.Pausing():
			if err := r.taskUpdateProgress(ts, status.Pausing, 0); err != nil {
				r.app.Logger.Error(err)
			}
		case <-ts.ctx.Running():
			select {
			case slice, ok := <-ts.resultChan:
				if ok {
					ts.mutex.Lock()
					if err := r.icpTaskRepo.UpdateTaskSlice(slice); err != nil {
						r.app.Logger.Error(err)
					}
					ts.mutex.Unlock()
					if err := r.taskUpdateProgress(ts, status.Running, 1); err != nil {
						r.app.Logger.Error(err)
					}
				}
			case <-ts.ticker.C:
				if err := r.taskTicker(ts); err != nil {
					r.app.Logger.Error(err)
				}
			default:
			}
		default:

		}
	}
}

func (r *Bridge) TaskGetList(taskName string, pageNum, pageSize int) (*GetTaskListResult, error) {
	if taskName != "" {
		if err := r.historyRepo.CreateHistory(&models.History{Key: taskName, Type: history.ICP}); err != nil {
			r.app.Logger.Warn(err.Error())
		}
	}

	tasks, total, err := r.icpTaskRepo.FindByPartialKey(taskName, pageNum, pageSize)
	if err != nil {
		return nil, err
	}
	var items []*icp.Task
	for _, task := range tasks {
		task.Task.CreatedAt = task.BaseModel.CreatedAt
		items = append(items, task.Task)
	}

	return &GetTaskListResult{
		Total: total,
		Items: items,
	}, nil
}

func (r *Bridge) TaskGetByID(taskID int64) (*icp.Task, error) {
	task, err := r.icpTaskRepo.GetByTaskID(taskID, false)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return task.Task, nil
}

func (r *Bridge) TaskCreate(taskName string, targets []string, serviceTypes []string) error {
	serviceTypes = utils.RemoveEmptyAndDuplicateString(serviceTypes)
	if len(serviceTypes) == 0 {
		msg := "查询类型不能为空"
		r.app.Logger.Error(msg)
		return errors.New(msg)
	}
	for _, serviceType := range serviceTypes {
		if !utils.StringsContain(ServiceTypes, serviceType) {
			msg := "查询类型错误: " + serviceType
			r.app.Logger.Error(msg)
			return errors.New(msg)
		}
	}
	targets = utils.RemoveEmptyAndDuplicateString(targets)
	if len(targets) == 0 {
		msg := "目标不能为空"
		r.app.Logger.Error(msg)
		return errors.New(msg)
	}
	taskID := idgen.NextId()
	var taskSlices []*models.ICPTaskSlice
	for _, target := range targets {
		for _, serviceType := range serviceTypes {
			taskSlices = append(taskSlices, &models.ICPTaskSlice{
				TaskID:      taskID,
				UnitToQuery: target,
				Status:      status.Waiting,
				ServiceType: serviceType,
			})
		}
	}
	if err := r.icpTaskRepo.Create(&models.ICPTask{
		Task: &icp.Task{
			Name:         taskName,
			TaskID:       taskID,
			Total:        int64(len(targets) * len(serviceTypes)),
			Status:       status.Waiting,
			ServiceTypes: strings.Join(serviceTypes, "\n"),
			Targets:      strings.Join(targets, "\n"),
		},
		TaskSlices: taskSlices,
	}); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return nil
}

func (r *Bridge) TaskRun(taskID int64) error {
	ts, err := r.taskInitState(taskID, true)
	if err != nil {
		return err
	}
	if err := r.taskUpdateProgress(ts, status.Running, 0); err != nil {
		return err
	}
	go func() {
		r.taskExecute(ts)
	}()
	return nil
}

func (r *Bridge) TaskPause(taskID int64) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if ts, ok := r.taskState[taskID]; ok {
		ts.ctx.SendPausing()
		return nil
	}
	return errors.New("任务不存在或已结束")
}

func (r *Bridge) TaskPauseAll() {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	for taskID := range r.taskState {
		r.taskState[taskID].ctx.SendPausing()
	}
}

func (r *Bridge) TaskResume(taskID int64) error {
	task, err := r.icpTaskRepo.GetByTaskID(taskID, true)
	if err != nil {
		r.app.Logger.Error(err)
		return err
	}
	if task.Status != status.Paused && task.Status != status.Error {
		return errors.New("非已暂停任务")
	}
	ts, err := r.taskInitState(taskID, false)
	if err != nil {
		return err
	}
	if err := r.taskUpdateProgress(ts, status.Running, 0); err != nil {
		return err
	}
	go func() {
		r.taskExecute(ts)
	}()
	return nil
}

func (r *Bridge) TaskDelete(taskID int64) error {
	if err := r.icpTaskRepo.Delete(taskID); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return nil
}

func (r *Bridge) GetRunningTaskNum() int {
	tasks, _ := r.icpTaskRepo.GetRunningTasks()
	return len(tasks)
}

func (r *Bridge) TaskUpdateName(taskID int64, taskName string) error {
	if err := r.icpTaskRepo.UpdateName(taskID, taskName); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return nil
}

type GetTaskDataResult struct {
	Total int
	Items []*models.ItemWithID
}

func (r *Bridge) GetModel() *models.ItemWithID {
	return nil
}

func (r *Bridge) TaskGetData(unitName string, pageNum, pageSize int, taskID int64) (*GetTaskDataResult, error) {
	if unitName != "" {
		if err := r.historyRepo.CreateHistory(&models.History{Key: unitName, Type: history.ICP}); err != nil {
			r.app.Logger.Warn(err.Error())
		}
	}
	items, total, err := r.icpTaskRepo.FindByPartialKeyAndTaskID(unitName, pageNum, pageSize, taskID)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	return &GetTaskDataResult{
		Total: total,
		Items: items,
	}, nil
}

func (r *Bridge) TaskExportData(key string, taskID int64) (int64, error) {
	itemWithIDs, err := r.icpTaskRepo.FindResultByPartialKey(key, taskID)
	if err != nil {
		return 0, err
	}
	filename := fmt.Sprintf("ICP_%s.xlsx", utils.GenFilenameTimestamp())
	dir := r.app.Config.ExportDataDir
	exportID := idgen.NextId()
	outputAbsFilepath := filepath.Join(dir, filename)
	if err := r.exportLogRepo.Create(&models.ExportLog{
		Item: exportlog.Item{
			Dir:      dir,
			Filename: filename,
			Status:   status.Running,
			ExportID: exportID,
		},
	}); err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		var items []*icp.Item
		for _, item := range itemWithIDs {
			items = append(items, item.Item)
		}
		service2.SaveToExcel(nil, r.exportLogRepo, exportID, event.ICPExport, r.app.Logger, func() error {
			return r.icp.Export(items, outputAbsFilepath)
		})
	}()
	return exportID, nil
}
