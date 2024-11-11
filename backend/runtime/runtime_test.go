package runtime

import (
	"fine/backend/app"
	"fine/backend/proxy"
	"testing"
)

func TestRuntime_OpenFileDialog(t *testing.T) {
	mainApp := app.NewApp()
	runtime := NewRuntime(mainApp)
	runtime.OpenFolder("D:\\Tools\\code\\fine-wails\\build\\bin\\data")
}

func TestRuntime_ReadFile(t *testing.T) {
	r := &Runtime{}
	_, _ = r.ReadFileAsBase64("D:\\Tools\\code\\fine-wails\\frontend\\src\\App.tsx")
}

func TestRuntime_CheckUpdate(t *testing.T) {
	r := NewRuntime(app.NewApp())
	proxyManager := proxy.NewManager()
	proxyManager.Add(r)
	proxyManager.SetProxy("http://127.0.0.1:8080")
	res, err := r.CheckUpdate()
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(res)
}
