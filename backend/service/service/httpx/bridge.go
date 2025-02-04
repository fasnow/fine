package httpx

import (
	"bufio"
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/logger"
	"fine/backend/runtime"
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
	app *app.App
}

func NewHttpxBridge(app *app.App) *Bridge {
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
		logger.Info(err.Error())
		return 0, err
	}
	_, err = file.WriteString(targets)
	if err != nil {
		logger.Info(err.Error())
		return 0, err
	}
	tmpFilename = file.Name()
	file.Close()
	args = strings.Fields(fmt.Sprintf("%s %s %s %s", path, flags, "-l", tmpFilename))
	cmd := exec.Command(args[0], args[1:]...)
	runtime.HideCmdWindow(cmd)
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	//任务缓存控制
	taskID := idgen.NextId()
	taskIDStr := strconv.FormatInt(taskID, 10)
	cache.Set(taskIDStr, cmd, 9999*time.Hour)

	if err := cmd.Start(); err != nil {
		logger.Info(err.Error())
		return 0, err
	}
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			constant.Emit(constant.Events.HttpxOutput, map[string]any{
				"taskID": taskID,
				"data":   string(scanner.Bytes()),
			})
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			constant.Emit(constant.Events.HttpxOutput, map[string]any{
				"taskID": taskID,
				"data":   string(scanner.Bytes()),
			})
		}

	}()
	go func() {
		defer cache.Delete(taskIDStr)
		err := cmd.Wait()
		if err != nil {
			logger.Info(err.Error())
		}
		constant.Emit(constant.Events.HttpxOutputDone, map[string]any{
			"taskID": taskID,
			"data":   "",
		})
		os.Remove(tmpFilename)
	}()
	return taskID, nil
}

func (r *Bridge) Stop(taskID int64) error {
	taskIDStr := strconv.Itoa(int(taskID))
	value, ok1 := cache.Get(taskIDStr)
	if !ok1 {
		logger.Info("无效taskID")
		return errors.New("无效taskID")
	}
	if cmd, ok2 := value.(*exec.Cmd); ok2 {
		if cmd != nil && cmd.Process != nil && (cmd.ProcessState == nil || !cmd.ProcessState.Exited()) {
			err := runtime.KillProcess(cmd)
			if err != nil {
				logger.Info(err.Error())
				return err
			}
		}
	}
	return nil
}

func (r *Bridge) SetConfig(path, flags string) error {
	config.GlobalConfig.Httpx.Flags = flags
	config.GlobalConfig.Httpx.Path = path
	err := config.Save()
	if err != nil {
		logger.Info(err)
		return err
	}
	return nil
}
