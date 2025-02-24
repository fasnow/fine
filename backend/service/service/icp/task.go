package icp

import (
	"errors"
	"fine/backend/application"
	"fine/backend/constant/status"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/service/model/icp"
	"fine/backend/utils"
	"github.com/yitter/idgenerator-go/idgen"
	"strings"
	"sync"
)

type TaskManager struct {
	app         *application.Application
	tasks       map[int]*icp.Task
	mu          sync.Mutex
	icpTaskRepo repository.IcpTaskRepository
}

func NewTaskManager(app *application.Application) *TaskManager {
	tm := &TaskManager{
		app:   app,
		tasks: make(map[int]*icp.Task),
	}
	return tm
}

func (r *TaskManager) CreateTask(taskName string, targets []string, serviceTypes []string) error {
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
	var units []*models.ICPTaskSlice
	for _, target := range targets {
		for _, serviceType := range serviceTypes {
			units = append(units, &models.ICPTaskSlice{
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
		TaskSlices: units,
	}); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return nil
}
