//go:build windows
// +build windows

package osoperation

import (
	"os"
	"os/exec"
	"syscall"
)

func HideCmdWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
}

func KillProcess(cmd *exec.Cmd) error {
	return cmd.Process.Signal(os.Kill)
}
