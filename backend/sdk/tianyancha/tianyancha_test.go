package tianyancha

import (
	"github.com/fasnow/ghttp"
	"github.com/goccy/go-json"
	"strings"
	"testing"
)

func Test_Suggest(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	result, err := client.Suggest("北京天融信科技有限公司")
	if err != nil {
		t.Log(err)
		return
	}
	for _, info := range result {
		marshal, err2 := json.Marshal(info)
		if err2 != nil {
			t.Log(err2)
			return
		}
		t.Log(string(marshal))
	}
	t.Log(strings.Repeat("-", 20))
	result, err = client.Suggest("测试")
	if err != nil {
		t.Log(err)
		return
	}
	for _, info := range result {
		marshal, err2 := json.Marshal(info)
		if err2 != nil {
			t.Log(err2)
			return
		}
		t.Log(string(marshal))
	}
}

func Test_GetBaseInfo(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	result, err := client.GetBaseInfo("1740741037")
	if err != nil {
		t.Log(err)
		return
	}
	marshal, err := json.Marshal(result)
	if err != nil {
		t.Log(marshal)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result, err = client.GetBaseInfo("123456")
	if err != nil {
		t.Log(err)
		return
	}
	marshal, err4 := json.Marshal(result)
	if err4 != nil {
		t.Log(marshal)
		return
	}
}

func Test_GetShareholderInfo(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetShareholder("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetShareholder("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetInvestmentInfo(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetInvestment("22822", 0)
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetInvestment("123456", 0)
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetApp(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetApp("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetApp("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetSupplier(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetSupplier("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetSupplier("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetSubsidiary(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetSubsidiary("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetSubsidiary("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetWechat(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetWechat("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetWechat("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetWeibo(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetWeibo("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetWeibo("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}

func Test_GetAll(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.Get("22822", 1, 2, 1)
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	//result2, err2 = client.Get("123456", 0, 1)
	//if err2 != nil {
	//	t.Log(err2)
	//	return
	//}
	//marshal, err2 = json.Marshal(result2)
	//if err2 != nil {
	//	t.Log(err2)
	//	return
	//}
	//t.Log(string(marshal))
}

func TestExport(t *testing.T) {
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := NewClient()
	client.SetToken("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA5NjM1NTMzMCIsImlhdCI6MTY5NjY0MjU0MiwiZXhwIjoxNjk5MjM0NTQyfQ.gtBoBU3NESesvm_MwcxBp9jXuYJuj2UH5bu8MW7oM1eqKRbwc0dT4ITNlzyVVB6iLZQeMIyH3b-BtOgyGzXI5A")
	result2, err2 := client.GetApp("22822")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 := json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
	t.Log(strings.Repeat("-", 20))
	result2, err2 = client.GetApp("123456")
	if err2 != nil {
		t.Log(err2)
		return
	}
	marshal, err2 = json.Marshal(result2)
	if err2 != nil {
		t.Log(err2)
		return
	}
	t.Log(string(marshal))
}
