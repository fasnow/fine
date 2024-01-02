package httpoutput

import (
	"fine-server/server/statuscode"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"sync"
)

var wsStdOutputLock sync.Mutex
var wsStdErrOutputLock sync.Mutex

// AllQueryStep1Result 返回给前端的数据结构体
type resp[T any] struct {
	Error string                `json:"message"`
	Code  statuscode.StatusCode `json:"code"`
	Data  T                     `json:"data"`
}

// stdOutput 用于输出无错误时的数据
func stdOutput[T any](v T) resp[T] {
	var r resp[T]
	r.Error = ""
	r.Code = 200
	r.Data = v
	return r
}

// errOutput 用于输出带错误信息的空数据
func errOutput(code statuscode.StatusCode, error error) resp[any] {
	var resp resp[any]
	resp.Error = error.Error()
	resp.Code = code
	resp.Data = nil
	return resp
}

func HttpErrOutput(c *gin.Context, code statuscode.StatusCode, err error) {
	c.JSON(200, errOutput(code, err))
}

func HttpStdOutput(c *gin.Context, v any) {
	c.JSON(200, stdOutput(v))
}

func WsStdOutput(c *websocket.Conn, v any) {
	wsStdOutputLock.Lock()
	if err := c.WriteJSON(stdOutput(v)); err != nil {
		log.Println(err)
	}
	wsStdOutputLock.Unlock()
}

func WsErrOutput(c *websocket.Conn, code statuscode.StatusCode, err error) {
	wsStdErrOutputLock.Lock()
	if err := c.WriteJSON(errOutput(code, err)); err != nil {
		log.Println(err)
	}
	wsStdErrOutputLock.Unlock()
}
