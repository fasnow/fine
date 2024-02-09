//go:build !windows
// +build !windows

package runtime

import (
	"os"
	"os/exec"
)

func HideCmdWindow(cmd *exec.Cmd) {
}

func KillProcess(cmd *exec.Cmd) error {
	return cmd.Process.Signal(os.Interrupt)
}
