package aiqicha

import (
	"encoding/json"
	"fine/backend/application"
	"fmt"
	"github.com/fasnow/goproxy"
	"strings"
	"testing"
)

func TestAiQiCha_Suggest(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	_ = m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	list, err := c.Suggest("中国移动集团")
	if err != nil {
		t.Error(err)
		return
	}
	marshal, e := json.Marshal(list)
	if e != nil {
		return
	}
	t.Log(string(marshal))
}

func TestAiQiCha_GetStockChart(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	_ = m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	list, err := c.GetStockChart("28683666725524", "0")
	if err != nil {
		t.Error(err)
		return
	}
	marshal, e := json.Marshal(list)
	if e != nil {
		return
	}
	t.Log(string(marshal))
}

func TestAiQiCha_GetCopyrightList(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	total, list, err := c.GetCopyrights("28783255028393", 1, 10)
	if err != nil {
		t.Error(err)
		return
	}
	fmt.Println(total)
	for _, i := range list {
		fmt.Println(i)
	}
}

func TestAiQiCha_GetBranchList(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	total, list, err := c.GetBranches("28783255028393", 1, 1)
	if err != nil {
		t.Error(err)
		return
	}
	fmt.Println(total)
	for _, i := range list {
		fmt.Println(i)
	}
}

func TestAiQiCha_GetInvestRecords(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	result, err := c.GetInvestRecordByDepthAndRate("29448922540331", -1, 0.5, 1)
	if err != nil {
		t.Error(err)
		return
	}
	//bytes, err := json.Marshal(result)
	//if err != nil {
	//	return
	//}
	//fmt.Println(string(bytes))
	PrintTreeEnhanced(result)

}

func TestAiQiCha_GetAllCopyrights(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	result, err := c.GetAllCopyrights("29448922540331")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(len(result))
	for _, i := range result {
		t.Log(i)
	}
}

func TestAiQiCha_GetAllBranches(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	result, err := c.GetAllBranches("31610236813812")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(len(result))
	for _, i := range result {
		t.Log(i)
	}
}

func TestAiQiCha_HeadInfo(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	result, err := c.HeadInfo("31610236813812")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(result)
}

// 深度优先打印 (DFS)
func PrintTreeDFS(root *ExportNode) {
	var dfs func(*ExportNode, int)
	dfs = func(node *ExportNode, level int) {
		if node == nil {
			return
		}

		// 打印当前节点 (带缩进表示层级)
		indent := strings.Repeat("  ", level)
		fmt.Printf("%s- %s (PID: %s, 注册资本: %s)\n",
			indent,
			node.EntName,
			node.Pid,
			node.RegCapital)

		// 递归打印子节点
		for _, child := range node.ChildrenNodes {
			dfs(child, level+1)
		}
	}

	fmt.Println("=== 深度优先遍历 ===")
	dfs(root, 0)
	fmt.Println()
}

// 广度优先打印 (BFS)
func PrintTreeBFS(root *ExportNode) {
	if root == nil {
		return
	}

	fmt.Println("=== 广度优先遍历 ===")

	queue := []*ExportNode{root}
	currentLevel := 0

	for len(queue) > 0 {
		levelSize := len(queue)
		fmt.Printf("=== 第 %d 层 ===\n", currentLevel)

		for i := 0; i < levelSize; i++ {
			node := queue[0]
			queue = queue[1:]

			// 打印当前节点
			fmt.Printf("  - %s (PID: %s, 状态: %s)\n",
				node.EntName,
				node.Pid,
				node.CancelStatus)

			// 将子节点加入队列
			for _, child := range node.ChildrenNodes {
				queue = append(queue, child)
			}
		}
		currentLevel++
	}
	fmt.Println()
}

// 增强版打印（组合DFS+BFS并显示更多字段）
func PrintTreeEnhanced(root *ExportNode) {
	// 打印基础信息
	fmt.Printf("\n===== 公司投资结构 =====\n")
	fmt.Printf("根节点: %s (PID: %s)\n", root.EntName, root.Pid)

	// 打印DFS
	PrintTreeDFS(root)

	// 打印BFS
	PrintTreeBFS(root)

	// 打印统计信息
	var countNodes func(*ExportNode) int
	countNodes = func(node *ExportNode) int {
		if node == nil {
			return 0
		}
		count := 1
		for _, child := range node.ChildrenNodes {
			count += countNodes(child)
		}
		return count
	}

	fmt.Printf("=== 统计 ===\n")
	fmt.Printf("总节点数: %d\n", countNodes(root))
	fmt.Printf("最大深度: %d\n", getMaxDepth(root))
	fmt.Println("====================")
}

// 辅助函数：计算树的最大深度
func getMaxDepth(root *ExportNode) int {
	if root == nil {
		return 0
	}

	maxDepth := 0
	for _, child := range root.ChildrenNodes {
		if depth := getMaxDepth(child); depth > maxDepth {
			maxDepth = depth
		}
	}
	return maxDepth + 1
}

func TestAiQiCha_Export(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	result, err := c.GetInvestTree("28783255028393", 1, 0, 1, []string{"icp"})
	if err != nil {
		t.Error(err)
		return
	}

	if err := c.Export(result, "./1.xlsx"); err != nil {
		t.Log(err)
		return
	}
}

func TestAiQiCha_GetAllICPs(t *testing.T) {
	c := New(application.DefaultApp.Config.AiQiCha.Cookie)
	m := goproxy.New()
	m.SetProxy("http://127.0.0.1:8081")
	c.UseProxyManager(m)
	icps, err := c.GetAllICPs("28783255028393")
	if err != nil {
		t.Error(err)
		return
	}
	for _, icp := range icps {
		t.Log(icp.Domain)
	}
}
