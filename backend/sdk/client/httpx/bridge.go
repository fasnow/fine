package httpx

import (
	"bufio"
	"fine/backend/app"
	"fine/backend/event"
	"fine/backend/runtime"
	"fmt"
	"github.com/pkg/errors"
	"os/exec"
	"strings"
)

type Bridge struct {
	cmd *exec.Cmd
	app *app.App
}

func NewHttpxBridge(app *app.App) *Bridge {
	return &Bridge{
		app: app,
	}
}

func (r *Bridge) Run(path, flags, inputFlag string, targets string) error {
	if path == "" || inputFlag == "" {
		return errors.New("未指定程序或输入参数")
	}

	t := strings.Join(strings.Split(targets, "\n"), ",")
	args := strings.Fields(fmt.Sprintf("%s %s %s %s", path, flags, inputFlag, t))
	r.cmd = exec.Command(args[0], args[1:]...)
	runtime.HideCmdWindow(r.cmd)
	stdout, _ := r.cmd.StdoutPipe()
	stderr, _ := r.cmd.StderrPipe()

	if err := r.cmd.Start(); err != nil {
		r.cmd = nil
		return err
	}
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			event.Emit(event.GetSingleton().HttpxOuput, string(scanner.Bytes()))
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			event.Emit(event.GetSingleton().HttpxOuput, string(scanner.Bytes()))
		}
	}()
	go func() {
		err := r.cmd.Wait()
		if err != nil {
			fmt.Println("Error waiting for command:", err)
		}
		event.Emit(event.GetSingleton().HttpxOuputDone, "")
	}()
	return nil
}

func (r *Bridge) Stop() error {
	if r.cmd != nil && r.cmd.Process != nil && (r.cmd.ProcessState == nil || !r.cmd.ProcessState.Exited()) {
		return runtime.KillProcess(r.cmd)
	}
	return nil
}
