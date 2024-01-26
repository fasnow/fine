package utils

import (
	"github.com/pkg/errors"
	"os/exec"
	"runtime"
)

type OpenDefaultBrowser struct {
}

func (o *OpenDefaultBrowser) Open(url string) error {
	var cmd *exec.Cmd
	switch os := runtime.GOOS; os {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	default:
		return errors.New("Unsupported platform")
	}
	return cmd.Start()
}
