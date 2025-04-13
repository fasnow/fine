package application

import (
	"context"
	"fine/backend/matcher"
	"fmt"
	"os"
	"reflect"
	"runtime"
	"strconv"
	"testing"
	"time"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/v4/process"
)

func TestGetDefaultRegex(t *testing.T) {
	app := NewApp()
	rules := app.Config.Wechat.Rules

	t.Log("默认正则表达式规则:")
	for _, rule := range rules {

		t.Logf("规则ID: %d, 名称: %s, 启用状态: %v",
			rule.ID,
			rule.Name,
			rule.Enable,
		)
		for i, regex := range rule.Regexes {
			tt := strconv.Quote(regex)
			t.Log(i, tt)
		}
	}
}

func TestContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	chan1 := make(chan int, 3)
	chan2 := make(chan int, 3)
	go func() {
		for {
			select {
			case data, ok := <-chan1:
				if !ok {
					fmt.Println(1, "return")
					return
				}
				fmt.Println(1, data)
			case <-ctx.Done():
				fmt.Println(1)
				return
			}
		}
	}()
	go func() {
		for {
			select {
			case data, ok := <-chan2:
				if !ok {
					fmt.Println(2, "return")
					return
				}
				fmt.Println(2, data)
			case <-ctx.Done():
				fmt.Println(2)
				return
			}
		}
	}()
	go func() {
		for i := 0; i < 2; i++ {
			chan1 <- i
			//time.Sleep(1 * time.Second)
		}
	}()
	go func() {
		for i := 0; i < 2; i++ {
			chan2 <- i
			//time.Sleep(1 * time.Second)
		}
	}()
	go func() {
		time.Sleep(3 * time.Second)
		cancel()
	}()
	select {}
}

func TestUpdateCheck(t *testing.T) {
	checkUpdate, err := DefaultApp.CheckUpdate()
	if err != nil {
		return
	}
	t.Log(checkUpdate)
}

func TestLog(t *testing.T) {
	DefaultApp.Logger.Info(DefaultApp.Config.Wechat.Rules)
}

func TestMatcher(t *testing.T) {
	// 创建测试用例
	tests := []struct {
		name     string
		rules    []*matcher.Rule
		content  string
		expected []matcher.MatchResult
	}{
		{
			name: "基本匹配测试",
			rules: []*matcher.Rule{
				{
					ID:      1,
					Name:    "测试规则1",
					Enable:  true,
					Regexes: []string{"test(\\d+)"},
				},
			},
			content: "test123 test456",
			expected: []matcher.MatchResult{
				{
					Rule: &matcher.Rule{
						ID:      1,
						Name:    "测试规则1",
						Enable:  true,
						Regexes: []string{"test(\\d+)"},
					},
					Matches: []string{"123", "456"},
				},
			},
		},
		{
			name: "禁用规则测试",
			rules: []*matcher.Rule{
				{
					ID:      1,
					Name:    "禁用规则",
					Enable:  false,
					Regexes: []string{"test(\\d+)"},
				},
			},
			content:  "test123 test456",
			expected: nil,
		},
		{
			name: "多规则测试",
			rules: []*matcher.Rule{
				{
					ID:      1,
					Name:    "规则1",
					Enable:  true,
					Regexes: []string{"test(\\d+)"},
				},
				{
					ID:      2,
					Name:    "规则2",
					Enable:  true,
					Regexes: []string{"foo(bar)"},
				},
			},
			content: "test123 foobar",
			expected: []matcher.MatchResult{
				{
					Rule: &matcher.Rule{
						ID:      1,
						Name:    "规则1",
						Enable:  true,
						Regexes: []string{"test(\\d+)"},
					},
					Matches: []string{"123"},
				},
				{
					Rule: &matcher.Rule{
						ID:      2,
						Name:    "规则2",
						Enable:  true,
						Regexes: []string{"foo(bar)"},
					},
					Matches: []string{"bar"},
				},
			},
		},
	}

	// 运行测试用例
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := matcher.New(tt.rules)
			got := m.FindAllOptimized(tt.content)

			if len(got) != len(tt.expected) {
				t.Errorf("匹配结果数量不一致, got %v, want %v", len(got), len(tt.expected))
				return
			}

			for i := range got {
				if got[i].Rule.ID != tt.expected[i].Rule.ID {
					t.Errorf("规则ID不匹配, got %v, want %v", got[i].Rule.ID, tt.expected[i].Rule.ID)
				}

				if !reflect.DeepEqual(got[i].Matches, tt.expected[i].Matches) {
					t.Errorf("匹配结果不一致, got %v, want %v", got[i].Matches, tt.expected[i].Matches)
				}
			}
		})
	}
}
func TestMatcherWithDefaultRules(t *testing.T) {
	m := matcher.New(DefaultApp.Config.Wechat.Rules)
	m.SetRules(DefaultApp.Config.Wechat.Rules)

	tests := []struct {
		name     string
		content  string
		expected []matcher.MatchResult
	}{
		{
			name:    "测试默认规则",
			content: "username: 张三, password: 123456",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := m.FindAllOptimized(tt.content)

			for i := range got {
				t.Log(got[i].Rule.ID, got[i].Matches)
				// if got[i].Rule.ID != tt.expected[i].Rule.ID {
				// 	t.Errorf("规则ID不匹配, got %v, want %v", got[i].Rule.ID, tt.expected[i].Rule.ID)
				// }

				// if !reflect.DeepEqual(got[i].Matches, tt.expected[i].Matches) {
				// 	t.Errorf("匹配结果不一致, got %v, want %v", got[i].Matches, tt.expected[i].Matches)
				// }
			}
		})
	}
}

func TestSystemInfo(t *testing.T) {
	// ticker := time.NewTicker(1 * time.Second)
	// defer ticker.Stop()

	// for range ticker.C {
	// 	info := DefaultApp.GetSystemInfo()
	// 	if info != nil {
	// 		t.Logf("系统CPU使用率: %.2f%%, 进程CPU使用率: %.2f%%", info.SystemCPU, info.ProcCPU)
	// 	}
	// }
	// 获取系统整体CPU使用率
	// 获取系统总CPU使用率（所有核心的平均值）
	// 获取CPU核心数
	numCPU := runtime.NumCPU()

	// 获取CPU使用信息
	totalPercent, userPercent, err := getCPUUsage()
	if err != nil {
		fmt.Printf("获取CPU使用率失败: %v\n", err)
		return
	}

	// 获取当前程序CPU使用率
	processPercent, err := getProcessCPUUsage()
	if err != nil {
		fmt.Printf("获取进程CPU使用率失败: %v\n", err)
		return
	}

	// 计算剩余CPU使用率
	remainingPercent := 100.0 - totalPercent
	if remainingPercent < 0 {
		remainingPercent = 0
	}

	// 输出结果
	fmt.Printf("CPU核心数: %d\n", numCPU)
	fmt.Printf("系统总CPU使用率: %.2f%%\n", totalPercent)
	fmt.Printf("用户空间CPU使用率: %.2f%%\n", userPercent)
	fmt.Printf("当前程序CPU使用率: %.2f%% (单核等效)\n", processPercent)
	fmt.Printf("剩余CPU可用率: %.2f%%\n", remainingPercent)
}

// 获取当前进程CPU使用率
func getProcessCPUUsage() (float64, error) {
	p, err := process.NewProcess(int32(os.Getpid()))
	if err != nil {
		return 0, err
	}

	// 获取1秒内的CPU使用率
	percent, err := p.Percent(1 * time.Second)
	if err != nil {
		return 0, err
	}

	// 如果是多核系统，转换为单核等效值
	percent = percent / float64(runtime.NumCPU())

	return percent, nil
}

// 获取CPU使用信息：返回总使用率和用户空间使用率
func getCPUUsage() (float64, float64, error) {
	// 获取1秒内的CPU时间统计
	times, err := cpu.Times(false)
	if err != nil {
		return 0, 0, err
	}
	if len(times) == 0 {
		return 0, 0, fmt.Errorf("未获取到CPU时间数据")
	}

	// 第一次采样
	t1 := times[0]
	total1 := t1.User + t1.System + t1.Idle + t1.Nice + t1.Iowait + t1.Irq + t1.Softirq + t1.Steal + t1.Guest + t1.GuestNice

	// 等待1秒
	time.Sleep(1 * time.Second)

	// 第二次采样
	times, err = cpu.Times(false)
	if err != nil {
		return 0, 0, err
	}
	if len(times) == 0 {
		return 0, 0, fmt.Errorf("未获取到CPU时间数据")
	}

	t2 := times[0]
	total2 := t2.User + t2.System + t2.Idle + t2.Nice + t2.Iowait + t2.Irq + t2.Softirq + t2.Steal + t2.Guest + t2.GuestNice

	// 计算差值
	totalDelta := total2 - total1
	if totalDelta == 0 {
		return 0, 0, fmt.Errorf("CPU时间无变化")
	}

	// 计算总使用率(非空闲时间占比)
	totalUsed := (t2.User + t2.System + t2.Nice + t2.Iowait + t2.Irq + t2.Softirq + t2.Steal + t2.Guest + t2.GuestNice) -
		(t1.User + t1.System + t1.Nice + t1.Iowait + t1.Irq + t1.Softirq + t1.Steal + t1.Guest + t1.GuestNice)
	totalPercent := (totalUsed / totalDelta) * 100

	// 计算用户空间使用率
	userUsed := t2.User - t1.User
	userPercent := (userUsed / totalDelta) * 100

	return totalPercent, userPercent, nil
}
