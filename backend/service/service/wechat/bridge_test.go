package wechat

import (
	"encoding/json"
	"fine/backend/application"
	"testing"
)

func TestBridge_GetAllMiniProgram(t *testing.T) {
	app := application.DefaultApp
	c := NewBridge(app)
	miniPrograms, err := c.GetAllMiniApp()
	if err != nil {
		t.Error(err)
		return
	}
	bytes, _ := json.Marshal(miniPrograms)
	t.Log(string(bytes))
}

func TestBridge_extractInfo(t *testing.T) {
	//app := application.DefaultApp
	//c := NewBridge(app)
	//c.extractInfo("wxc76247c1ed91383e", "17")
}

func TestBridge_GetWechatRules(t *testing.T) {
	app := application.DefaultApp
	c := NewBridge(app)

	// 测试获取规则
	rules := c.GetWechatRules()

	// 验证规则不为空
	if len(rules) == 0 {
		t.Error("获取规则为空")
		return
	}

	// 打印规则信息
	for _, rule := range rules {
		t.Logf("规则ID: %d, 名称: %s, 启用状态: %v, 正则表达式: %v",
			rule.ID,
			rule.Name,
			rule.Enable,
			rule.Regexes,
		)
	}
}
func TestBridge_UpdateWechatRule(t *testing.T) {
	app := application.DefaultApp
	c := NewBridge(app)

	// 获取现有规则
	rules := c.GetWechatRules()
	if len(rules) == 0 {
		t.Error("获取规则为空")
		return
	}

	// 选择第5个规则进行修改
	testRule := rules[6]

	// 修改规则内容
	testRule.Name = "测试修改规则名称"
	testRule.Enable = !testRule.Enable
	testRule.Regexes = []string{"\"(?i)(?:http[s]?://)(?:[\\\\w-]+\\\\.)+[\\\\w-]+(?:/[\\\\w-./?%&=]*)?\""}

	// 更新规则
	err := c.UpdateWechatRule(&testRule)
	if err != nil {
		t.Errorf("更新规则失败: %v", err)
		return
	}
}
