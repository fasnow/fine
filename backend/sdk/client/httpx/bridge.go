package httpx

import (
	"bufio"
	"fine/backend/app"
	"fmt"
	"github.com/pkg/errors"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/text/encoding/simplifiedchinese"
	"os"
	"os/exec"
	runtime2 "runtime"
	"strings"
	"syscall"
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
	if runtime2.GOOS == "windows" {
		r.cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	}

	stdout, _ := r.cmd.StdoutPipe()
	stderr, _ := r.cmd.StderrPipe()

	if err := r.cmd.Start(); err != nil {
		r.cmd = nil
		return err
	}
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			decodeBytes, _ := simplifiedchinese.GB18030.NewDecoder().Bytes(scanner.Bytes())
			fmt.Println(string(decodeBytes))
			runtime.EventsEmit(r.app.GetContext(), "httpx", string(decodeBytes))
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			decodeBytes, _ := simplifiedchinese.GB18030.NewDecoder().Bytes(scanner.Bytes())
			fmt.Println(string(decodeBytes))
			runtime.EventsEmit(r.app.GetContext(), "httpx", string(decodeBytes))
		}
	}()
	go func() {
		err := r.cmd.Wait()
		if err != nil {
			fmt.Println("Error waiting for command:", err)
		}
		runtime.EventsEmit(r.app.GetContext(), "httpxDone")
	}()
	return nil
}

func (r *Bridge) Stop() error {
	if r.cmd != nil && r.cmd.Process != nil && (r.cmd.ProcessState == nil || !r.cmd.ProcessState.Exited()) {
		if runtime2.GOOS == "windows" {
			err := r.cmd.Process.Signal(os.Kill)
			return err
		}
		err := r.cmd.Process.Signal(os.Interrupt)
		return err
	}
	return nil
}
