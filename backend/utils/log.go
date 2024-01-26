package utils

import (
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
)

// Logger 自定义日志记录器
type Logger struct {
	errorLogger *log.Logger
	infoLogger  *log.Logger
}

// NewMyLogger 创建一个新的 Logger 实例
func NewMyLogger(fileName string) *Logger {
	// 创建一个新的程序自带的错误日志记录器，将日志输出到文件中
	errorFile, err := os.OpenFile(fileName, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Fatal(err)
	}
	errorLogger := log.New(io.MultiWriter(errorFile, os.Stderr), "[ERROR] ", log.LstdFlags)

	// 创建一个新的程序自带的信息日志记录器，将日志输出到文件中
	infoFile, err := os.OpenFile("log.txt", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Fatal(err)
	}
	infoLogger := log.New(io.MultiWriter(infoFile, os.Stdout), "[INFO] ", log.LstdFlags)

	return &Logger{errorLogger: errorLogger, infoLogger: infoLogger}
}

// 记录错误日志
func (l *Logger) Error(msg string, err error) {
	// 获取调用者和错误行
	pc, file, line, _ := runtime.Caller(1)
	funcName := runtime.FuncForPC(pc).Name()
	errorLine := fmt.Sprintf("%s:%d:%s(): ", file, line, funcName)

	// 记录日志
	if err != nil {
		l.errorLogger.Printf("%s%s - %s", errorLine, msg, err.Error())
	} else {
		l.errorLogger.Printf("%s%s", errorLine, msg)
	}
}

// Info 记录信息日志
func (l *Logger) Info(msg string) {
	// 获取调用者和信息行
	pc, file, line, _ := runtime.Caller(1)
	funcName := runtime.FuncForPC(pc).Name()
	infoLine := fmt.Sprintf("%s:%d:%s(): ", file, line, funcName)

	// 记录日志
	l.infoLogger.Printf("%s%s", infoLine, msg)
}
