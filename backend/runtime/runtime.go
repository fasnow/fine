package runtime

import (
	"fine/backend/app"
	"fmt"
	"github.com/buger/jsonparser"
	"github.com/fasnow/ghttp"
	"github.com/pkg/errors"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"
)

type Runtime struct {
	app *app.App
}

func NewRuntime(app *app.App) *Runtime {
	return &Runtime{app: app}
}

func (r *Runtime) GetPlatform() string {
	return runtime.GOOS
}

func (r *Runtime) ShowItemInFolder(dir, filename string) error {
	absFilePath := filepath.Join(dir, filename)
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin": // macOS
		cmd = exec.Command("open", "-R", absFilePath)
	case "linux": // Linux
		cmd = exec.Command("xdg-open", absFilePath)
	case "windows": // Windows
		cmd = exec.Command("cmd", "/c", "explorer", "/select,", absFilePath)
		HideCmdWindow(cmd)
	default:
		return os.ErrInvalid
	}
	return cmd.Start()
}

func (r *Runtime) OpenFolder(path string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin": // macOS
		cmd = exec.Command("open", path)
	case "linux": // Linux
		cmd = exec.Command("xdg-open", path)
	case "windows": // Windows
		cmd = exec.Command("cmd", "/c", "explorer", path)
		HideCmdWindow(cmd)
	default:
		return os.ErrInvalid
	}
	return cmd.Start()
}

func (r *Runtime) OpenFile(dir, filename string) error {
	var cmd *exec.Cmd
	absFilePath := filepath.Join(dir, filename)
	fmt.Println(absFilePath)
	switch runtime.GOOS {
	case "darwin": // macOS
		cmd = exec.Command("open", absFilePath)
	case "linux": // Linux
		cmd = exec.Command("xdg-open", absFilePath)
	case "windows": // Windows
		cmd = exec.Command("cmd", "/c", "start", absFilePath)
		HideCmdWindow(cmd)
	default:
		return os.ErrInvalid
	}
	return cmd.Start()
}

func (r *Runtime) CheckUpdate() (map[string]string, error) {
	httpClient := ghttp.Client{Timeout: 10 * time.Second}
	request, err := http.NewRequest("GET", "https://api.github.com/repos/fasnow/fine/releases/latest", nil)
	if err != nil {
		return nil, err
	}
	resp, err := httpClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
		}
	}(resp.Body)
	body, err := ioutil.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return nil, errors.New(string(body))
	}
	tagName, err := jsonparser.GetString(body, "tag_name")
	if err != nil {
		return nil, err
	}
	htmlUrl, err := jsonparser.GetString(body, "html_url")
	if err != nil {
		return nil, err
	}
	description, err := jsonparser.GetString(body, "body")
	if err != nil {
		return nil, err
	}
	return map[string]string{
		"version":     tagName,
		"description": description,
		"url":         htmlUrl,
	}, nil
}

func (r *Runtime) OpenFileDialog() (string, error) {
	fmt.Println(r.app.GetContext())
	path, err := wailsRuntime.OpenFileDialog(r.app.GetContext(), wailsRuntime.OpenDialogOptions{
		Title: "选择文件",
	})
	if err != nil {
		return "", err
	}
	return path, nil
}
