package tianyancha

import (
	"fine-server/server/httpoutput"
	"fine-server/server/initialize"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
)

func Suggest(c *gin.Context) {
	var key = strings.TrimSpace(c.Query("key"))
	if key == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("关键字不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.Suggest(key)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetBaseInfo(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	info, err := initialize.TianYanChaClient.GetBaseInfo(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, info)
}

func GetApp(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetApp(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetWechat(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetWechat(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetWeibo(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetWeibo(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetShareholder(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetShareholder(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetInvestment(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	var ratio = c.GetFloat64("ratio")
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetInvestment(id, ratio)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetSubsidiary(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetSubsidiary(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}

func GetSupplier(c *gin.Context) {
	var id = strings.TrimSpace(c.Query("id"))
	if id == "" {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, fmt.Errorf("id不能为空"))
		return
	}
	items, err := initialize.TianYanChaClient.GetSupplier(id)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
		return
	}
	httpoutput.HttpStdOutput(c, items)
}
