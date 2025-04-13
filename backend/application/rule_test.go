package application

import (
	"regexp"
	"testing"
)

func TestDefaultRegex(t *testing.T) {
	// 测试手机号规则
	t.Run("手机号规则测试", func(t *testing.T) {
		validCases := []string{
			"13812345678",
			"+8613812345678",
			"phone=13111111111",
			"phone = 13111111111",
			"phone = \"13111111111\"",
			"phone = '13111111111'",
			"['13111111111','13111111112']",
			">13111111111 ",
		}

		invalidCases := []string{
			"12345678901",
			"17091381234567812",
			"123456789012",
			"1231311111111123",
			"131111111111",
		}

		// 测试有效用例
		for _, content := range validCases {
			t.Run("有效用例: "+content, func(t *testing.T) {
				matched := false
				var matchedRegex string
				for _, rule := range DefaultRegex {
					if rule.Name == "手机号" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, content); matched {
								matchedRegex = regex
								break
							}
						}
						break
					}
				}
				if !matched {
					t.Errorf("测试用例失败:\n目标字符串: %s\n匹配的正则: %s\n期望结果: true\n实际结果: false",
						content, matchedRegex)
				}
			})
		}

		// 测试无效用例
		for _, content := range invalidCases {
			t.Run("无效用例: "+content, func(t *testing.T) {
				matched := false
				var matchedRegex string
				for _, rule := range DefaultRegex {
					if rule.Name == "手机号" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, content); matched {
								matchedRegex = regex
								break
							}
						}
						break
					}
				}
				if matched {
					t.Errorf("测试用例失败:\n目标字符串: %s\n匹配的正则: %s\n期望结果: false\n实际结果: true",
						content, matchedRegex)
				}
			})
		}
	})

	// 测试身份证规则
	t.Run("身份证规则测试", func(t *testing.T) {
		testCases := []struct {
			name     string
			content  string
			expected bool
		}{
			{
				name:     "18位身份证",
				content:  "\"110101199003077758",
				expected: true,
			},
			{
				name:     "18位身份证带X",
				content:  "\"11010119900307775X",
				expected: true,
			},
			{
				name:     "15位身份证",
				content:  "\"110101900307775",
				expected: true,
			},
			{
				name:     "无效身份证",
				content:  "12345678901234567",
				expected: false,
			},
			{
				name:     "超长身份证",
				content:  "11010119900307775881",
				expected: false,
			},
			{
				name:     "非身份证格式",
				content:  "abcdefghijklmnopqr",
				expected: false,
			},
			{
				name:     "其他格式身份证",
				content:  "=\"1101019003077751\"",
				expected: false,
			},
			{
				name:     "其他格式身份证2",
				content:  "[\"110101900307775\",\"110101900307775\"]",
				expected: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				matched := false
				for _, rule := range DefaultRegex {
					if rule.Name == "身份证" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, tc.content); matched {
								break
							}
						}
						break
					}
				}
				if matched != tc.expected {
					t.Errorf("期望匹配结果为 %v，实际结果为 %v", tc.expected, matched)
				}
			})
		}
	})

	// 测试URL规则
	t.Run("URL规则测试", func(t *testing.T) {
		testCases := []struct {
			name     string
			content  string
			expected bool
		}{
			{
				name:     "标准URL",
				content:  "http://example.com/path",
				expected: true,
			},
			{
				name:     "带查询参数的URL",
				content:  "https://example.com/path?param=value",
				expected: true,
			},
			{
				name:     "带路径参数的URL",
				content:  "/api/v1/users",
				expected: true,
			},
			{
				name:     "带HTTP方法的URL",
				content:  "GET /api/v1/users",
				expected: true,
			},
			{
				name:     "带括号的HTTP方法URL",
				content:  "post(\"/api/v1/users\")",
				expected: true,
			},
			{
				name:     "带括号的完整URL",
				content:  "post(\"http://example.com/path\")",
				expected: true,
			},
			{
				name:     "带单引号的HTTP方法URL",
				content:  "post('/api/v1/users')",
				expected: true,
			},
			{
				name:     "带单引号的完整URL",
				content:  "post('http://example.com/path')",
				expected: true,
			},
			{
				name:     "带子域名的URL",
				content:  "https://sub.example.com/path",
				expected: true,
			},
			{
				name:     "带端口的URL",
				content:  "http://example.com:8080/path",
				expected: true,
			},
			{
				name:     "带片段的URL",
				content:  "http://example.com/path#section",
				expected: true,
			},
			{
				name:     "无效URL",
				content:  "not-a-url",
				expected: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				matched := false
				for _, rule := range DefaultRegex {
					if rule.Name == "Url" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, tc.content); matched {
								break
							}
						}
						break
					}
				}
				if matched != tc.expected {
					t.Errorf("期望匹配结果为 %v，实际结果为 %v", tc.expected, matched)
				}
			})
		}
	})

	// 测试账号密码规则
	t.Run("账号密码规则测试", func(t *testing.T) {
		testCases := []struct {
			name     string
			content  string
			expected bool
		}{
			{
				name:     "用户名配置",
				content:  "username=admin",
				expected: true,
			},
			{
				name:     "密码配置",
				content:  "password=123456",
				expected: true,
			},
			{
				name:     "带引号的用户名配置",
				content:  "username= \"admin\"",
				expected: true,
			},
			{
				name:     "带引号的密码配置",
				content:  "password = \"123456\"",
				expected: true,
			},
			{
				name:     "中文用户名配置",
				content:  "用户名=张三",
				expected: true,
			},
			{
				name:     "中文密码配置",
				content:  "密码=123456",
				expected: true,
			},
			{
				name:     "带冒号的配置",
				content:  "username:admin",
				expected: true,
			},
			{
				name:     "带冒号引号的配置",
				content:  "username:\"admin\"",
				expected: true,
			},
			{
				name:     "带空格的配置",
				content:  "username = admin",
				expected: true,
			},
			{
				name:     "无效配置",
				content:  "invalid=value",
				expected: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				matched := false
				for _, rule := range DefaultRegex {
					if rule.Name == "账号密码" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, tc.content); matched {
								break
							}
						}
						break
					}
				}
				if matched != tc.expected {
					t.Errorf("期望匹配结果为 %v，实际结果为 %v", tc.expected, matched)
				}
			})
		}
	})

	// 测试JDBC规则
	t.Run("JDBC规则测试", func(t *testing.T) {
		testCases := []struct {
			name     string
			content  string
			expected bool
		}{
			{
				name:     "JDBC URL配置",
				content:  "jdbc.url=jdbc:mysql://localhost:3306/db",
				expected: true,
			},
			{
				name:     "JDBC驱动配置",
				content:  "jdbc.driver=com.mysql.jdbc.Driver",
				expected: true,
			},
			{
				name:     "带引号的JDBC配置",
				content:  "jdbc.url=\"jdbc:mysql://localhost:3306/db\"",
				expected: true,
			},
			{
				name:     "带注释的JDBC配置",
				content:  "#jdbc.url=jdbc:mysql://localhost:3306/db",
				expected: true,
			},
			{
				name:     "无效JDBC配置",
				content:  "not.jdbc=value",
				expected: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				matched := false
				for _, rule := range DefaultRegex {
					if rule.Name == "jdbc" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, tc.content); matched {
								break
							}
						}
						break
					}
				}
				if matched != tc.expected {
					t.Errorf("期望匹配结果为 %v，实际结果为 %v", tc.expected, matched)
				}
			})
		}
	})

	// 测试Key规则
	t.Run("Key规则测试", func(t *testing.T) {
		testCases := []struct {
			name     string
			content  string
			expected bool
		}{
			{
				name:     "Access Token配置",
				content:  "access_token=1234567890abcdef",
				expected: true,
			},
			{
				name:     "API Key配置",
				content:  "api_key=1234567890abcdef",
				expected: true,
			},
			{
				name:     "带下划线的Key配置",
				content:  "access_key_id=1234567890abcdef",
				expected: true,
			},
			{
				name:     "带引号的Key配置",
				content:  "access_token=\"1234567890abcdef\"",
				expected: true,
			},
			{
				name:     "带冒号的Key配置",
				content:  "access_token:1234567890abcdef",
				expected: true,
			},
			{
				name:     "无效Key配置",
				content:  "not_a_key=value",
				expected: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				matched := false
				for _, rule := range DefaultRegex {
					if rule.Name == "key" && rule.Enable {
						for _, regex := range rule.Regexes {
							if matched = matchRegex(regex, tc.content); matched {
								break
							}
						}
						break
					}
				}
				if matched != tc.expected {
					t.Errorf("期望匹配结果为 %v，实际结果为 %v", tc.expected, matched)
				}
			})
		}
	})
}

// matchRegex 辅助函数，用于测试正则表达式匹配
func matchRegex(pattern, content string) bool {
	re, err := regexp.Compile(pattern)
	if err != nil {
		return false
	}
	return re.MatchString(content)
}
