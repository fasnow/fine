package matcher

import (
	"fine/backend/utils"
	"fmt"
	"regexp"
	"runtime"
	"sync"
)

var (
	mu             sync.RWMutex
	maxConcurrency int = runtime.NumCPU() * 3
)

type MatchResult struct {
	Rule    *Rule
	Matches []string
}

type Rule struct {
	ID      int64
	Name    string
	Enable  bool
	Regexes []string
}

type Matcher struct {
	rules    []*Rule
	regexMap sync.Map
	mutex    sync.Mutex
}

func New(rules []*Rule) *Matcher {
	return &Matcher{
		rules: rules,
	}
}

func (r *Matcher) getRegex(regex string) (*regexp.Regexp, error) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if value, ok := r.regexMap.Load(regex); ok {
		if t, ok := value.(*regexp.Regexp); ok {
			return t, nil
		}
		return nil, fmt.Errorf("unexpected type in regexMap for key %s", regex)
	}
	compiled, err := regexp.Compile(regex)
	if err != nil {
		return nil, err
	}
	r.regexMap.Store(regex, compiled)
	return compiled, nil
}

func (r *Matcher) SetRules(rules []*Rule) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.regexMap.Clear()
	r.rules = rules
}

func (r *Matcher) FindAllOptimized(content string) []MatchResult {
	var results []MatchResult

	// 并发处理规则匹配
	var wg sync.WaitGroup
	resultChan := make(chan MatchResult, len(r.rules))

	// 创建信号量来限制并发协程数
	semaphore := make(chan struct{}, maxConcurrency)

	for _, rule := range r.rules {
		if !rule.Enable {
			continue
		}

		wg.Add(1)
		go func(rule *Rule) {
			defer wg.Done()

			// 获取信号量
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			var matches []string
			for _, regex := range rule.Regexes {
				// 从缓存获取编译后的正则表达式
				re, err := r.getRegex(regex)
				if err != nil {
					continue
				}

				// 执行匹配
				submatches := re.FindAllStringSubmatch(content, -1)
				for _, submatch := range submatches {
					if len(submatch) > 1 {
						matches = append(matches, submatch[1:]...)
					} else if len(submatch) == 1 {
						matches = append(matches, submatch[0])
					}
				}
			}

			if len(matches) > 0 {
				resultChan <- MatchResult{
					Rule:    rule,
					Matches: utils.RemoveEmptyAndDuplicateString(matches),
				}
			}
		}(rule)
	}

	// 等待所有goroutine完成
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// 收集结果
	for result := range resultChan {
		results = append(results, result)
	}

	return results
}

// 批量处理多个内容的匹配
func (r *Matcher) FindAllBatch(contents []string) [][]MatchResult {
	results := make([][]MatchResult, len(contents))

	var wg sync.WaitGroup
	// 创建信号量来限制并发协程数
	semaphore := make(chan struct{}, maxConcurrency)

	for i, content := range contents {
		wg.Add(1)
		go func(idx int, text string) {
			defer wg.Done()

			// 获取信号量
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			results[idx] = r.FindAllOptimized(text)
		}(i, content)
	}

	wg.Wait()
	return results
}

// SetMaxConcurrency 设置全局最大并发协程数
func SetMaxConcurrency(max int) {
	if max > 0 {
		maxConcurrency = max
	}
	mu.Lock()
	defer mu.Unlock()
	maxConcurrency = max
}

// GetMaxConcurrency 获取全局最大并发协程数
func GetMaxConcurrency() int {
	return maxConcurrency
}
