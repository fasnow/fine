package statuscode

type StatusCode int

const (
	CodeOK                          StatusCode = 200
	CodeFofaAuthError               StatusCode = 1101
	CodeHunterAuthError             StatusCode = 1102
	CodeZoneAuthError               StatusCode = 1103
	CodeQuakeAuthError              StatusCode = 1104
	CodeFofaQueryError              StatusCode = 1201
	CodeHunterQueryError            StatusCode = 1202
	CodeZoneQueryError              StatusCode = 1203
	CodeQuakeQueryError             StatusCode = 1204
	CodeTianYanQueryError           StatusCode = 1205
	CodeIcpQueryError               StatusCode = 1206
	CodeWsReadError                 StatusCode = 1301
	CodeWsWriteError                StatusCode = 1302
	CodeNotJsonFormatError          StatusCode = 1401
	CodeNotSpecifiedJsonFormatError StatusCode = 1402
	CodeAiZhanQueryError            StatusCode = 1501
	CodeOtherError                  StatusCode = 1999
)
