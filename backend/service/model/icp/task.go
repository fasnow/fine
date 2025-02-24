package icp

import "time"

type Task struct {
	CreatedAt    time.Time `json:"createdAt"` // 创建时间
	Name         string    `json:"name"`      // 任务名称
	TaskID       int64     `json:"taskID" gorm:"unique"`
	Status       int       `json:"status"`       // 记录当前运行状态
	ServiceTypes string    `json:"serviceTypes"` // 查询类型
	Targets      string    `json:"targets"`      // 目标
	Total        int64     `json:"total"`        // 总数
	Current      int64     `json:"current"`      // 已查询数
	TimeSpent    float64   `json:"timeSpent"`    // 用时s
	Message      string    `json:"message"`
}
