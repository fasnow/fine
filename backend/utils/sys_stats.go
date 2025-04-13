package utils

import (
	"fmt"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/process"
)

// SystemStats 包含系统和当前程序的资源使用情况
type SystemStats struct {
	PID               int32   // 当前进程ID
	SystemCPUUsage    float64 // 系统CPU使用率(百分比)
	ProcessCPUUsage   float64 // 当前程序CPU使用率(百分比)
	ProcessMemUsage   uint64  // 当前程序内存使用量(字节)
	ProcessMemPercent float64 // 当前程序内存占用百分比
	TotalMemory       uint64  // 系统总内存(字节)
	AvailableMemory   uint64  // 系统可用内存(字节)
	CPUCores          int     // CPU核心数
}

// GetSystemStats 获取系统和当前程序的资源使用情况
func GetSystemStats() (*SystemStats, error) {
	stats := &SystemStats{
		PID:      int32(os.Getpid()),
		CPUCores: runtime.NumCPU(),
	}

	// 获取当前进程
	p, err := process.NewProcess(int32(os.Getpid()))
	if err != nil {
		return nil, fmt.Errorf("获取进程信息失败: %v", err)
	}

	var wg sync.WaitGroup
	var sysCPUErr, procCPUErr, memErr error

	// 获取系统CPU使用率
	wg.Add(1)
	go func() {
		defer wg.Done()
		// 获取每个核心的CPU使用率
		cpuPercent, err := cpu.Percent(300*time.Millisecond, true)
		if err != nil {
			sysCPUErr = fmt.Errorf("获取系统CPU使用率失败: %v", err)
			return
		}
		// 计算所有核心的平均使用率
		var total float64
		for _, percent := range cpuPercent {
			total += percent
		}
		stats.SystemCPUUsage = total / float64(len(cpuPercent))
	}()

	// 获取进程CPU使用率
	wg.Add(1)
	go func() {
		defer wg.Done()
		processPercent, err := p.Percent(300 * time.Millisecond)
		if err != nil {
			procCPUErr = fmt.Errorf("获取进程CPU使用率失败: %v", err)
			return
		}
		stats.ProcessCPUUsage = processPercent / float64(stats.CPUCores)
	}()

	// 获取内存信息
	wg.Add(1)
	go func() {
		defer wg.Done()
		// 获取系统内存信息
		vmStat, err := mem.VirtualMemory()
		if err != nil {
			memErr = fmt.Errorf("获取内存信息失败: %v", err)
			return
		}
		stats.TotalMemory = vmStat.Total
		stats.AvailableMemory = vmStat.Available

		// 获取当前进程内存使用情况
		memInfo, err := p.MemoryInfo()
		if err != nil {
			memErr = fmt.Errorf("获取进程内存信息失败: %v", err)
			return
		}
		stats.ProcessMemUsage = memInfo.RSS

		memPercent, err := p.MemoryPercent()
		if err != nil {
			memErr = fmt.Errorf("获取进程内存百分比失败: %v", err)
			return
		}
		stats.ProcessMemPercent = float64(memPercent)
	}()

	wg.Wait()

	if sysCPUErr != nil {
		return nil, sysCPUErr
	}
	if procCPUErr != nil {
		return nil, procCPUErr
	}
	if memErr != nil {
		return nil, memErr
	}

	return stats, nil
}

// formatBytes 格式化字节数为易读格式
func formatBytes(b uint64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := uint64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.2f %cB", float64(b)/float64(div), "KMGTPE"[exp])
}
