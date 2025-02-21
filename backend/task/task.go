package task

import (
	"fine/backend/service/service/icp"
)

type Manager struct {
	ICP *icp.Bridge
}

func (r *Manager) CheckRunningTask() {
	r.ICP.PauseAllTask()
}

func (r *Manager) PauseAllTask() {
	r.ICP.PauseAllTask()
}
