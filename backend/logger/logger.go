package logger

import (
	"fine/backend/utils"
	"fmt"
	"github.com/sirupsen/logrus"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// getCallerInfo 获取调用者信息
func getCallerInfo() (string, int, string) {
	for i := 1; ; i++ {
		pc, file, line, ok := runtime.Caller(i)
		if !ok {
			// 如果无法获取调用者信息，返回空值
			return "", -1, ""
		}
		// 过滤掉 logrus 内部调用和日志库自身的调用
		if !strings.Contains(file, "github.com/sirupsen/logrus") &&
			!strings.Contains(file, "logger/logger.go") {
			// 提取文件名
			fileName := filepath.Base(file)
			// 获取函数名
			funcName := runtime.FuncForPC(pc).Name()
			// 只保留函数名，去除包名前缀
			//lastDotIndex := strings.LastIndex(funcName, ".")
			//if lastDotIndex != -1 {
			//	funcName = funcName[lastDotIndex+1:]
			//}
			return fileName, line, funcName
		}
	}
}

// CustomTextFormatter 自定义日志格式，去除计算机用户信息
type CustomTextFormatter struct {
	logrus.TextFormatter
}

func (f *CustomTextFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	//entry.Data = filter(entry.Data)
	return f.TextFormatter.Format(entry)
}

// filter 去除计算机用户信息的辅助函数
func filter(data logrus.Fields) logrus.Fields {
	if _, exists := data["token"]; exists {
		data["token"] = "****"
	}
	if _, exists := data["key"]; exists {
		data["key"] = "****"
	}
	return data
}

// NewWithLogDir 创建一个新的日志器，指定日志目录
func NewWithLogDir(DataDir string) *logrus.Logger {
	var logger = logrus.New()

	// 创建日志目录
	logDir, _ := filepath.Abs(DataDir)
	utils.CreateDirectory(logDir)

	// 初始化日志文件和日期
	var logFile *os.File
	currentDate := time.Now().Format("2006-01-02")
	logFilePath := filepath.Join(logDir, currentDate+".txt")
	var err error
	logFile, err = os.OpenFile(logFilePath, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0664)
	if err != nil {
		logger.Warnf("Failed to log to file %s, using default stderr: %v", logFilePath, err)
	}

	// 同时输出到文件和控制台
	logger.SetOutput(io.MultiWriter(logFile, os.Stdout)) // writer先后顺序不能变，不然在windows下会无法写入文件，不知道什么原因

	// 设置自定义日志格式和启用调用者信息
	logger.SetFormatter(&CustomTextFormatter{
		logrus.TextFormatter{
			FullTimestamp:  true,
			DisableSorting: false,
			CallerPrettyfier: func(frame *runtime.Frame) (function string, file string) {
				fileName, line, funcName := getCallerInfo()
				return funcName, fileName + ":" + strconv.Itoa(line)
			},
		},
	})

	logger.SetReportCaller(true)
	logger.SetLevel(logrus.DebugLevel)
	logger.AddHook(&DailyLogFileHook{
		logDir:      logDir,
		currentFile: logFile,
		currentDate: currentDate,
	})
	return logger
}

type DailyLogFileHook struct {
	logDir      string
	currentFile *os.File
	currentDate string
}

func (h *DailyLogFileHook) Levels() []logrus.Level {
	return logrus.AllLevels
}

// Fire 在每次记录日志时触发
func (h *DailyLogFileHook) Fire(entry *logrus.Entry) error {
	now := time.Now()
	date := now.Format("2006-01-02")
	if date != h.currentDate {
		if h.currentFile != nil {
			h.currentFile.Close()
		}
		newLogFilePath := filepath.Join(h.logDir, date+".txt")
		var err error
		h.currentFile, err = os.OpenFile(newLogFilePath, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0664)
		if err != nil {
			return fmt.Errorf("failed to open new log file %s: %v", newLogFilePath, err)
		}
		h.currentDate = date
		entry.Logger.SetOutput(io.MultiWriter(h.currentFile, os.Stdout))
	}
	return nil
}
