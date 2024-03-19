package client

import (
	"errors"
)

const (
	FofaDefaultPageSize   = 200
	HunterDefaultPageSize = 20
	ZoneDefaultPageSize   = 40
	QuakeDefaultPageSize  = 20
)
const (
	WrongJsonFormat                   = "looking for beginning of value"
	QuakeUnexpectedJsonResponse       = "unexpected json response"
	QuakeInvalidKey                   = "invalid key"
	QuakeUnauthorized                 = "/quake/login"
	UnexpectedResponse                = "unexpected response"
	QuakeUnexpectedJsonResponseOfUser = "unexpected user structure"
)

var (
	UnexpectedStructureError      = errors.New("服务端返回非预期数据")
	UnexpectedQueryTypeError      = errors.New("unexpected query type")
	UnexpectedQueryStatementError = errors.New("unexpected query statement")
	UnexpectedFieldTypeError      = errors.New("unexpected field type")
	ErrorQueryStatement           = errors.New("查询语句不能为空")
	ErrorQueryPage                = errors.New("页码必须大于0")
	ErrorQuerySize                = errors.New("分页大小必须大于0")
	NonStatusOK                   = errors.New("服务端返回非200响应码")
)
