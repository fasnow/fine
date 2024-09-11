package runtime

import (
	"encoding/base64"
	"fine/backend/app"
	"fine/backend/proxy"
	"github.com/buger/jsonparser"
	"github.com/pkg/errors"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
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

type UpdateHttpClient struct {
	Client *http.Client
}

func (r *Runtime) CheckUpdate() (map[string]string, error) {
	client := UpdateHttpClient{
		Client: &http.Client{},
	}
	err := proxy.GetSingleton().Add(&client)
	if err != nil {
		return nil, err
	}
	request, err := http.NewRequest("GET", "https://api.github.com/repos/fasnow/fine/releases/latest", nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Client.Do(request)
	if err != nil {
		return nil, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
		}
	}(resp.Body)
	body, err := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return nil, errors.New(strconv.Itoa(resp.StatusCode))
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
	path, err := wailsRuntime.OpenFileDialog(r.app.GetContext(), wailsRuntime.OpenDialogOptions{
		Title: "选择文件",
	})
	if err != nil {
		return "", err
	}
	return path, nil
}

func (r *Runtime) OpenDirectoryDialog() (string, error) {
	path, err := wailsRuntime.OpenDirectoryDialog(r.app.GetContext(), wailsRuntime.OpenDialogOptions{
		Title: "选择目录",
	})
	if err != nil {
		return "", err
	}
	return path, nil
}

func (r *Runtime) ReadFileAsBase64(filename string) (string, error) {
	bytes, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(bytes), nil
}

func (r *Runtime) WriteFile(filename string, byteData string) error {
	dir := filepath.Dir(filename)
	if err := os.MkdirAll(dir, 0644); err != nil {
		return err
	}
	decodeString, err := base64.StdEncoding.DecodeString(byteData)
	if err != nil {
		return err
	}
	return os.WriteFile(filename, decodeString, 0644)
}
