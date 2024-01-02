package ip138

import (
	"errors"
	ip1382 "fine-server/sdk/ip138"
	"fine-server/server/httpoutput"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"github.com/gin-gonic/gin"
	"strings"
)

var Ip138QueryClient = ip1382.NewClient()

func Ip138GetDomainCurrentIp(c *gin.Context) {
	domain := strings.TrimSpace(c.Query("domain"))
	if domain == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("目标不能为空")))
		return
	}
	ips, msg, err := Ip138QueryClient.Domain.GetCurrentIP(domain)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	var response = struct {
		Message string           `json:"message"`
		Items   []*ip1382.IPItem `json:"items"`
	}{Message: msg, Items: ips}
	httpoutput.HttpStdOutput(c, response)
}

func Ip138GetDomainHistoryIp(c *gin.Context) {
	domain := strings.TrimSpace(c.Query("domain"))
	if domain == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("目标不能为空")))
		return
	}
	ips, err := Ip138QueryClient.Domain.GetHistoryIP(domain)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, ips)
}

func Ip138GetIpCurrentDomain(c *gin.Context) {
	ip := strings.TrimSpace(c.Query("ip"))
	if ip == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("目标不能为空")))
		return
	}
	domains, err := Ip138QueryClient.IP.GetCurrentDomain(ip)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, domains)
}
