package httpx

import (
	"bufio"
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/status"
	"fine/backend/osoperation"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

type Bridge struct {
	app *application.Application
}

func NewHttpxBridge(app *application.Application) *Bridge {
	return &Bridge{
		app: app,
	}
}

var cache = utils.NewCache() //存储正在运行的任务

func (r *Bridge) Run(path, flags, targets string) (int64, error) {
	var args []string
	var tmpFilename string
	if path == "" {
		return 0, errors.New("未指定程序或输入参数")
	}
	file, err := os.CreateTemp("", "temp*.txt")
	if err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	if _, err = file.WriteString(targets); err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	tmpFilename = file.Name()
	file.Close()
	args = strings.Fields(fmt.Sprintf("%s %s %s %s", path, flags, "-l", tmpFilename))
	cmd := exec.Command(args[0], args[1:]...)
	osoperation.HideCmdWindow(cmd)
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	//任务缓存控制
	taskID := idgen.NextId()
	taskIDStr := strconv.FormatInt(taskID, 10)
	cache.Set(taskIDStr, cmd, 9999*time.Hour)

	if err := cmd.Start(); err != nil {
		r.app.Logger.Error(err)
		return 0, err
	}
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			data := string(scanner.Bytes())
			event.EmitV2(event.Httpx, event.EventDetail{
				ID:     taskID,
				Status: status.Running,
				Data:   data,
			})
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			data := string(scanner.Bytes())
			event.Emit(event.Httpx, event.EventDetail{
				ID:     taskID,
				Status: status.Running, //此处不能用Error返回，httpx报版本过时也是stderr
				Data:   data,
			})
		}
	}()
	go func() {
		defer cache.Delete(taskIDStr)
		if err := cmd.Wait(); err != nil {
			r.app.Logger.Error(err)
		}
		event.Emit(event.Httpx, event.EventDetail{
			Status: status.Stopped,
			ID:     taskID,
		})
		os.Remove(tmpFilename)
	}()
	return taskID, nil
}

func (r *Bridge) Stop(pageID int64) error {
	taskIDStr := strconv.Itoa(int(pageID))
	value, ok1 := cache.Get(taskIDStr)
	if !ok1 {
		msg := "无效taskID"
		r.app.Logger.Error(msg)
		return errors.New(msg)
	}
	if cmd, ok2 := value.(*exec.Cmd); ok2 {
		if cmd != nil && cmd.Process != nil && (cmd.ProcessState == nil || !cmd.ProcessState.Exited()) {
			if err := osoperation.KillProcess(cmd); err != nil {
				r.app.Logger.Error(err)
				return err
			}
		}
	}
	return nil
}

func (r *Bridge) SetConfig(path, flags string) error {
	r.app.Config.Httpx.Flags = flags
	r.app.Config.Httpx.Path = path
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return nil
}
