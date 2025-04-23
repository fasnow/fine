package portscan

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"encoding/base64"

	"golang.org/x/net/proxy"
)

// ScanResult 表示端口扫描的结果
type ScanResult struct {
	Host     string
	Port     int
	IsOpen   bool
	Error    error
	Duration time.Duration
	// Protocol 表示端口使用的协议类型,如TCP、UDP等
	Protocol string
}

// Scanner 端口扫描器
type Scanner struct {
	ctx     context.Context
	timeout time.Duration
	proxy   string // 支持http、socks5代理
	mu      sync.Mutex
}

// NewScanner 创建一个新的端口扫描器
func NewScanner() *Scanner {
	return &Scanner{
		ctx:     context.Background(),
		timeout: 10 * time.Second,
	}
}

// SetTimeout 设置超时时间
func (s *Scanner) SetTimeout(timeout time.Duration) *Scanner {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.timeout = timeout
	return s
}

// 设置代理
func (s *Scanner) SetProxy(proxy string) *Scanner {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.proxy = proxy
	return s
}

// 设置上下文
func (s *Scanner) SetContext(ctx context.Context) *Scanner {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.ctx = ctx
	return s
}

// 获取上下文和cancel
func (s *Scanner) GetContext() (context.Context, context.CancelFunc) {
	return context.WithCancel(s.ctx)
}

// 获取代理
func (s *Scanner) GetProxy() string {
	return s.proxy
}

// 获取超时时间
func (s *Scanner) GetTimeout() time.Duration {
	return s.timeout
}

// TcpScan 执行TCP端口扫描
func (s *Scanner) TcpScan(host string, port int) ScanResult {
	// 检查上下文是否已取消
	select {
	case <-s.ctx.Done():
		result := ScanResult{
			Host:  host,
			Port:  port,
			Error: s.ctx.Err(),
		}
		return result
	default:
	}
	result := ScanResult{
		Host: host,
		Port: port,
	}

	// 创建dialer
	dialer := &net.Dialer{
		Timeout: s.timeout,
	}

	// 如果设置了代理,解析代理URL
	if s.proxy != "" {
		proxyURL, err := url.Parse(s.proxy)
		if err != nil {
			result.Error = err
			return result
		}

		// 根据代理类型设置不同的dialer
		switch proxyURL.Scheme {
		case "http", "https":
			// 处理代理认证
			var proxyAuth *url.Userinfo
			if proxyURL.User != nil {
				proxyAuth = proxyURL.User
			}

			// 使用HTTP代理的CONNECT方法
			transport := &http.Transport{
				Proxy: http.ProxyURL(proxyURL),
				DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
					return dialer.DialContext(ctx, network, addr)
				},
				// 设置代理认证
				ProxyConnectHeader: http.Header{},
			}

			// 如果有认证信息，添加到请求头
			if proxyAuth != nil {
				username := proxyAuth.Username()
				password, _ := proxyAuth.Password()
				auth := username + ":" + password
				basicAuth := "Basic " + base64.StdEncoding.EncodeToString([]byte(auth))
				transport.ProxyConnectHeader.Add("Proxy-Authorization", basicAuth)
			}

			conn, err := transport.DialContext(s.ctx, "tcp", fmt.Sprintf("%s:%d", host, port))
			if err != nil {
				result.Error = err
				return result
			}
			defer conn.Close()
			result.IsOpen = true
			return result
		case "socks5":
			// 处理认证信息
			auth := &proxy.Auth{}
			if proxyURL.User != nil {
				auth.User = proxyURL.User.Username()
				if password, ok := proxyURL.User.Password(); ok {
					auth.Password = password
				}
			}

			// 创建socks5代理dialer
			dialerProxy, err := proxy.SOCKS5("tcp", proxyURL.Host, auth, proxy.Direct)
			if err != nil {
				result.Error = err
				return result
			}

			if contextDialer, ok := dialerProxy.(proxy.ContextDialer); ok {
				conn, err := contextDialer.DialContext(s.ctx, "tcp", fmt.Sprintf("%s:%d", host, port))
				if err != nil {
					result.Error = err
					return result
				}
				conn.Close()
				result.IsOpen = true
				return result
			} else {
				result.Error = errors.New("代理不支持context")
				return result
			}
		default:
			result.Error = fmt.Errorf("不支持的代理协议: %s", proxyURL.Scheme)
			return result
		}
	}

	// 构建目标地址
	target := fmt.Sprintf("%s:%d", host, port)

	// 尝试建立TCP连接
	conn, err := dialer.DialContext(s.ctx, "tcp", target)
	if err != nil {
		result.Error = err
		return result
	}
	defer conn.Close()

	result.IsOpen = true
	return result
}

// ScanPorts 并发扫描多个端口
func (s *Scanner) ScanPorts(host string, ports []int, resultChan chan<- ScanResult) {
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, s.config.concurrency)

	for _, port := range ports {
		// 检查上下文是否已取消
		select {
		case <-s.ctx.Done():
			return
		default:
		}

		wg.Add(1)
		semaphore <- struct{}{} // 获取信号量

		go func(p int) {
			defer wg.Done()
			defer func() { <-semaphore }() // 释放信号量

			// 再次检查上下文
			select {
			case <-s.ctx.Done():
				return
			default:
				result := s.TcpScan(host, p)
				// 确保通道未关闭
				select {
				case <-s.ctx.Done():
					return
				case resultChan <- result:
				}
			}
		}(port)
	}

	wg.Wait()
	close(resultChan)
}

// ParsePorts 解析端口字符串
func ParsePorts(portStr string) ([]int, error) {
	var ports []int
	portRanges := strings.Split(portStr, ",")

	for _, pr := range portRanges {
		pr = strings.TrimSpace(pr)
		if strings.Contains(pr, "-") {
			rangeParts := strings.Split(pr, "-")
			if len(rangeParts) != 2 {
				return nil, fmt.Errorf("无效的端口范围格式: %s", pr)
			}

			start, err := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
			if err != nil {
				return nil, fmt.Errorf("无效的起始端口: %s", rangeParts[0])
			}

			end, err := strconv.Atoi(strings.TrimSpace(rangeParts[1]))
			if err != nil {
				return nil, fmt.Errorf("无效的结束端口: %s", rangeParts[1])
			}

			if start > end {
				return nil, fmt.Errorf("起始端口不能大于结束端口: %d-%d", start, end)
			}

			for i := start; i <= end; i++ {
				ports = append(ports, i)
			}
		} else {
			port, err := strconv.Atoi(pr)
			if err != nil {
				return nil, fmt.Errorf("无效的端口号: %s", pr)
			}
			ports = append(ports, port)
		}
	}

	return ports, nil
}

// ScanPortString 扫描指定格式的端口字符串
func (s *Scanner) ScanPortString(host string, portStr string, resultChan chan<- ScanResult) error {
	ports, err := ParsePorts(portStr)
	if err != nil {
		return err
	}

	s.ScanPorts(host, ports, resultChan)
	return nil
}

// ScanState 表示扫描状态
type ScanState struct {
	Targets    []TargetState `json:"targets"`
	StartTime  time.Time     `json:"start_time"`
	LastUpdate time.Time     `json:"last_update"`
}

// TargetState 表示单个目标的扫描状态
type TargetState struct {
	Host      string `json:"host"`
	Ports     []int  `json:"ports"`
	Scanned   []int  `json:"scanned"`
	OpenPorts []int  `json:"open_ports"`
	Status    string `json:"status"` // "pending", "scanning", "completed"
}

// SaveState 保存扫描状态到文件
func (s *Scanner) SaveState(state *ScanState, filename string) error {
	state.LastUpdate = time.Now()
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filename, data, 0644)
}

// LoadState 从文件加载扫描状态
func (s *Scanner) LoadState(filename string) (*ScanState, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	var state ScanState
	if err := json.Unmarshal(data, &state); err != nil {
		return nil, err
	}

	return &state, nil
}

// ScanMultipleTargets 扫描多个目标
func (s *Scanner) ScanMultipleTargets(targets []string, portStr string, resultChan chan<- ScanResult, stateFile string) error {
	// 解析端口
	ports, err := ParsePorts(portStr)
	if err != nil {
		return err
	}

	// 尝试加载现有状态
	var state *ScanState
	if stateFile != "" {
		state, _ = s.LoadState(stateFile)
	}

	// 如果没有现有状态，创建新状态
	if state == nil {
		state = &ScanState{
			Targets:   make([]TargetState, len(targets)),
			StartTime: time.Now(),
		}
		for i, target := range targets {
			state.Targets[i] = TargetState{
				Host:   target,
				Ports:  ports,
				Status: "pending",
			}
		}
	}

	// 创建保存状态的定时器
	saveTicker := time.NewTicker(30 * time.Second)
	defer saveTicker.Stop()

	// 启动保存状态的goroutine
	go func() {
		for {
			select {
			case <-s.ctx.Done():
				return
			case <-saveTicker.C:
				if stateFile != "" {
					s.SaveState(state, stateFile)
				}
			}
		}
	}()

	// 扫描每个目标
	for i := range state.Targets {
		targetState := &state.Targets[i]
		if targetState.Status == "completed" {
			continue
		}

		targetState.Status = "scanning"
		if stateFile != "" {
			s.SaveState(state, stateFile)
		}

		// 创建目标特定的结果通道
		targetResultChan := make(chan ScanResult)

		// 启动扫描
		go func(ts *TargetState) {
			defer close(targetResultChan)

			// 确定需要扫描的端口
			remainingPorts := make([]int, 0)
			scannedMap := make(map[int]bool)
			for _, p := range ts.Scanned {
				scannedMap[p] = true
			}

			for _, p := range ts.Ports {
				if !scannedMap[p] {
					remainingPorts = append(remainingPorts, p)
				}
			}

			// 扫描剩余端口
			s.ScanPorts(ts.Host, remainingPorts, targetResultChan)
		}(targetState)

		// 处理结果
		for result := range targetResultChan {
			targetState.Scanned = append(targetState.Scanned, result.Port)
			if result.IsOpen {
				targetState.OpenPorts = append(targetState.OpenPorts, result.Port)
			}
			resultChan <- result
		}

		targetState.Status = "completed"
		if stateFile != "" {
			s.SaveState(state, stateFile)
		}
	}

	return nil
}
