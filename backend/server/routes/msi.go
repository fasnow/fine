package routes

import (
	"errors"
	config2 "fine-server/config"
	"fine-server/sdk"
	"fine-server/server/httpoutput"
	"fine-server/server/initialize"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"fmt"
	"github.com/buger/jsonparser"
	"github.com/fasnow/ghttp"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func GetAllConf(c *gin.Context) {
	var resp struct {
		Auth  config2.Auth  `json:"auth"`
		Proxy config2.Proxy `json:"proxy"`
	}
	var cfg = initialize.GetConfig()
	resp.Auth = cfg.Auth
	resp.Proxy = cfg.Proxy
	//config2.ReInit()
	httpoutput.HttpStdOutput(c, resp)
}

func GetProxyConf(c *gin.Context) {
	initialize.ReInit()
	httpoutput.HttpStdOutput(c, initialize.GetConfig().Proxy)
}

func SaveOtherConf(c *gin.Context) {
	var conf struct {
		Interval config2.Interval `yaml:"interval" json:"interval"`
		Timeout  int              `yaml:"timeout" json:"timeout"`
	}
	if err := c.ShouldBind(&conf); err != nil && err.Error() != NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	var cfg = initialize.GetConfig()
	cfg.Timeout = conf.Timeout
	cfg.Interval = conf.Interval
	err := config2.SaveConf(cfg)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("设置失败:"+err.Error())))
		return
	}
	//config2.ReInit()
	httpoutput.HttpStdOutput(c, conf)
}

func GetOtherConf(c *gin.Context) {
	var resp struct {
		Interval config2.Interval `yaml:"interval" json:"interval"`
		Timeout  int              `yaml:"timeout" json:"timeout"`
	}
	//config2.ReInit()
	var cfg = initialize.GetConfig()
	resp.Interval = cfg.Interval
	resp.Timeout = cfg.Timeout
	httpoutput.HttpStdOutput(c, resp)
}

func SaveProxyConf(c *gin.Context) {
	var conf config2.Proxy
	if err := c.ShouldBind(&conf); err != nil && err.Error() != NoJsonKeyStringError {
		httpoutput.HttpErrOutput(c, statuscode.CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
		return
	}
	conf.Type = strings.TrimSpace(conf.Type)
	conf.Host = strings.TrimSpace(conf.Host)
	conf.User = strings.TrimSpace(conf.User)
	conf.Pass = strings.TrimSpace(conf.Pass)
	//if !slices.Contains([]string{"http", "socks5"}, conf.Type) {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(errors.New("代理类型不正确")))
	//	return
	//}
	//if conf.Host == "" {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(errors.New("主机名不正确")))
	//	return
	//}
	//conf.Port = strings.TrimSpace(conf.Port)
	//if conf.Port == "" {
	//	HttpErrOutput(c, CodeOtherError, utils.FormatError(errors.New("端口不正确")))
	//	return
	//}
	var cfg = initialize.GetConfig()
	cfg.Proxy = conf
	err := config2.SaveConf(cfg)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("代理设置失败:"+err.Error())))
		return
	}
	if conf.Enable {
		if conf.User != "" {
			ghttp.SetGlobalProxy(fmt.Sprintf("%v://%v:%v@%v:%v", conf.Type, conf.User, conf.Pass, conf.Host, conf.Port))
		} else {
			ghttp.SetGlobalProxy(fmt.Sprintf("%v://%v:%v", conf.Type, conf.Host, conf.Port))
		}
	} else {
		ghttp.SetGlobalProxy("")
	}
	//config2.ReInit()
	httpoutput.HttpStdOutput(c, conf)
}

//func AiZhanSubdomainQuery(c *gin.Context) {
//	var body struct {
//		Domain string `json:"domain"` //needed
//	}
//	if err := c.ShouldBind(&body); err != nil && err.Error() != NoJsonKeyStringError {
//		HttpErrOutput(c, CodeNotSpecifiedJsonFormatError, utils.FormatError(err))
//		return
//	}
//	if strings.HasPrefix(body.Domain, "http://") {
//		body.Domain = body.Domain[7:]
//	} else if strings.HasPrefix(body.Domain, "https://") {
//		body.Domain = body.Domain[8:]
//	}
//	list, err := AiZhanQueryClient.SubdomainQuery(body.Domain)
//	if err != nil {
//		HttpErrOutput(c, CodeAiZhanQueryError, utils.FormatError(err))
//		return
//	}
//	var resp wsOutput
//	resp.HasMore = false
//	resp.Total = len(list)
//	resp.Data = list
//	HttpStdOutput(c, resp)
//}

func ExternalIp(c *gin.Context) {
	client := ghttp.Client{}
	var req, _ = http.NewRequest("GET", sdk.ExternalIpApiUrl, strings.NewReader(""))
	resp, err := client.Do(req)
	if err != nil {
		httpoutput.HttpStdOutput(c, "获取失败")
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		httpoutput.HttpStdOutput(c, "获取失败")
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	//// 匹配 IP 地址和来源
	//pattern := regexp.MustCompile(`您的iP地址是：\[<a[^>]*>([^<]*)</a>[^>]*>[^：]*：([^ ]*)`)
	//
	//// 提取匹配的字符串
	//match := pattern.FindStringSubmatch(string(body))
	//ip := ""
	//location := ""
	//if len(match) >= 3 {
	//	ip = match[1]
	//	location = match[2]
	//}
	//HttpStdOutput(c, ip+" | "+location)
	ip, err := jsonparser.GetString(body, "ip_addr")
	if err != nil {
		httpoutput.HttpStdOutput(c, "获取失败")
		return
	}
	httpoutput.HttpStdOutput(c, ip)
}

func CheckUpdate(c *gin.Context) {
	var r struct {
		Version     string `json:"version"`
		Description string `json:"description"`
		Url         string `json:"url"`
	}
	client := ghttp.Client{Timeout: 10 * time.Second}
	request, err := http.NewRequest("GET", updateUrl, nil)
	if err != nil {
		return
	}
	resp, err := client.Do(request)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
	}
	if resp.StatusCode != 200 {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, UnableToAccessUpdatesError)
		return
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
		}
	}(resp.Body)
	body, err := ioutil.ReadAll(resp.Body)
	tagName, err := jsonparser.GetString(body, "tag_name")
	if err != nil {
		r.Version = ""
		r.Description = "暂无更新"
		r.Url = ""
		httpoutput.HttpStdOutput(c, r)
		return
	}
	htmlUrl, err := jsonparser.GetString(body, "html_url")
	if err != nil {
		return
	}
	description, err := jsonparser.GetString(body, "body")
	if err != nil {
		return
	}
	r.Version = tagName
	r.Description = description
	r.Url = htmlUrl
	httpoutput.HttpStdOutput(c, r)
}

func SetHeaders(r *http.Request, headers []string) {
	for i := 0; i < len(headers); i++ {
		ky := strings.Split(headers[i], ":")
		key := strings.ToUpper(ky[0])
		value := ""
		if len(ky) > 1 {
			value = strings.Split(headers[i], ":")[1]
		}
		r.Header.Set(key, value)
	}
}

func SendExcelFileToClient(c *gin.Context, filename string) {
	// 设置响应头
	encodedFilename := url.QueryEscape(filepath.Base(filename)) //解决中文乱码
	c.Header("Access-Control-Expose-Headers", "Content-Disposition")
	c.Header("Content-Disposition", "attachment; filename="+encodedFilename)
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.File(filename)
}

func SendZipFileToClient(c *gin.Context, filename string) {
	// 设置响应头
	encodedFilename := url.QueryEscape(filename) //解决中文乱码
	c.Header("Access-Control-Expose-Headers", "Content-Disposition")
	c.Header("Content-Disposition", "attachment; filename="+encodedFilename)
	c.Header("Content-Type", "application/zip")
	c.File(filename)
}

func DownloadLog(c *gin.Context) {
	var action = strings.TrimSpace(c.Query("action"))
	switch action {
	case "clear":
		err := config2.ClearLog()
		if err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
			return
		}
		httpoutput.HttpStdOutput(c, nil)
		return
	case "remove":
		dir := strings.TrimSpace(c.Query("dir"))
		if dir == "" {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(fmt.Errorf("错误的文件夹")))
			return
		}
		filename := strings.TrimSpace(c.Query("filename"))
		if filename == "" {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(fmt.Errorf("错误的文件名")))
			return
		}
		err := config2.RemoveItem(filename, dir)
		if err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
			return
		}
		httpoutput.HttpStdOutput(c, nil)
		return
	case "get":
		start, err := strconv.Atoi(c.Query("start"))
		if err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(fmt.Errorf("错误的起始下标")))
			return
		}
		limit, err := strconv.Atoi(c.Query("limit"))
		if err != nil || limit < -1 {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(fmt.Errorf("错误的长度")))
			return
		}
		items, err := config2.GetDownloadLog(start, limit)
		if err != nil {
			httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(err))
			return
		}
		for i := 0; i < len(items); i++ {
			_, err = os.Stat(filepath.Join(items[i].Dir, items[i].Filename))
			if err == nil {
				(*items[i]).Exist = true
			} else if os.IsNotExist(err) {
				(*items[i]).Exist = false
			} else {
				(*items[i]).Exist = false
			}
		}
		httpoutput.HttpStdOutput(c, items)
	}
}
