package runtime

import (
	"fine/backend/app"
	"testing"
)

func TestRuntime_OpenFileDialog(t *testing.T) {
	mainApp := app.NewApp()
	runtime := NewRuntime(mainApp)
	runtime.OpenFolder("D:\\Tools\\code\\fine-wails\\build\\bin\\data")
}
