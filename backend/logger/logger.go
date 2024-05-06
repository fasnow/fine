package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

func Info(msg ...any) {
	logDir, _ := filepath.Abs(filepath.Join("log"))
	logFile := filepath.Join(logDir, time.Now().Format("2006-01-02")+".txt")

	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		//先创建log目录
		_ = os.MkdirAll(logDir, 0750)
	}

	// 如果不存在则创建，如果存在则追加写入
	file, err := os.OpenFile(logFile, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err == nil {
		defer file.Close()
	}
	pc, _, line, _ := runtime.Caller(1)
	output := fmt.Sprintf("[%s %s %d] %v\n", time.Now().Format("2006/01/02 15:04:05"), runtime.FuncForPC(pc).Name(), line, msg)
	_, err = file.WriteString(output)
	fmt.Print(output)
}
