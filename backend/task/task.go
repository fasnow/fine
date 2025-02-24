package task

import (
	"fine/backend/service/service/icp"
)

type Manager struct {
	ICP *icp.Bridge
}

func (r *Manager) CheckRunningTask() {
	r.ICP.TaskPauseAll()
}

func (r *Manager) PauseAllTask() {
	r.ICP.TaskPauseAll()
}
