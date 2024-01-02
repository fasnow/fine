package batchhttp

import (
	"encoding/json"
	"errors"
	"fine-server/server/httpoutput"
	"fine-server/server/routes"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"fmt"
	"github.com/fasnow/ghttp"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"golang.org/x/exp/slices"
	"golang.org/x/text/encoding/htmlindex"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"
)

func BatchHttp(c *gin.Context) {
	var httpWG sync.WaitGroup
	var countLock sync.Mutex
	var headers []string
	var isClosed bool
	conn, err := routes.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("无法升级为WebSocket连接")))
		log.Println(utils.FormatError(err))
		return
	}
	defer conn.Close()
	_, msg, err := conn.ReadMessage()
	if err != nil {
		httpoutput.WsErrOutput(conn, statuscode.CodeWsReadError, utils.FormatError(err))
		log.Println(utils.FormatError(err))
		return
	}
	//处理客户端发送断开连接请求
	go func() {
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				}
				isClosed = true
				return
			}
		}
	}()
	var body struct {
		Timeout         int      `json:"timeout"`
		CoroutineCount  int      `json:"coroutineCount"`
		Urls            []string `json:"urls"`
		Methods         []string `json:"methods"`
		Headers         string   `json:"headers"`
		IsCustomHeaders bool     `json:"isCustomHeaders"`
		Redirect        bool     `json:"redirect"`
		Data            string   `json:"data"`
	}
	err = json.Unmarshal(msg, &body)
	if err != nil {
		httpoutput.WsErrOutput(conn, statuscode.CodeNotJsonFormatError, utils.FormatError(err))
		return
	}
	if body.Timeout <= 0 || body.Timeout > 20 {
		httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("超时范围：(0, 20]")))
		return
	}

	if body.CoroutineCount <= 0 {
		httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("协程量范围：> 0")))
		return
	}
	headers = utils.RemoveEmptyStrings(strings.Split(body.Headers, "\n"))
	for i := 0; i < len(body.Methods); i++ {
		method := body.Methods[i]
		if !slices.Contains([]string{"GET", "POST"}, strings.ToUpper(method)) {
			httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("错误的请求方法："+method)))
			return
		}
		body.Methods[i] = strings.ToUpper(method)
	}

	//格式校验
	urls := utils.RemoveEmptyAndDuplicateStrings(body.Urls)
	l := len(urls)
	for i := 0; i < l; i++ {
		u := urls[i]

		//添加http和https
		if !strings.HasPrefix(u, "https://") && !strings.HasPrefix(u, "http://") &&
			!strings.HasPrefix(u, "://") && !strings.HasPrefix(u, ":") {
			urls[i] = "https://" + u
			urls = append(urls, "http://"+u)
		}

		//判断url是否符合格式
		_, err = url.Parse(urls[i])
		if err != nil {
			httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("格式错误，每行一个目标:"+u)))
			return
		}

	}
	urls = utils.RemoveEmptyAndDuplicateStrings(urls) //添加schema之后去重

	type resultItem struct {
		Method       string `json:"method"`
		Url          string `json:"url"`
		StatusCode   int    `json:"status_code"`
		Title        string `json:"title"`
		Length       int    `json:"length"`
		Redirect     string `json:"redirect,omitempty"`
		ReStatusCode int    `json:"re_status_code,omitempty"`
		ReTitle      string `json:"re_title,omitempty"`
		ReLength     int    `json:"re_length,omitempty"`
	}
	// 获取响应码：
	var lastItem []resultItem
	semaphore := make(chan bool, body.CoroutineCount) // 协程数量
	totalHttp := len(urls) * len(body.Methods)
	currentHttp := 0
	startTime := time.Now()
	isCompletedCh := make(chan bool, 1)
	isClosedCh := make(chan bool, 1)
	//发送最后一段结果
	httpWG.Add(1)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		completed := false
		for {
			if completed {
				err = conn.Close()
				if err != nil {
					return
				}
				return
			}
			select {
			case completed = <-isCompletedCh:
				if completed {
					r := routes.WsOutput{}
					r.Data = lastItem
					r.HasMore = false
					r.Message = "请求完毕"
					r.Total = totalHttp
					httpoutput.WsStdOutput(conn, r)
					return
				}
			case stopped := <-isClosedCh:
				if stopped {
					r := routes.WsOutput{}
					r.Total = totalHttp
					r.HasMore = false
					r.Message = "已中止"
					httpoutput.WsStdOutput(conn, r)
					return
				}
			}
			//}
		}
	}(&httpWG)

	for i := 0; i < len(body.Methods); i++ {
		method := body.Methods[i]
		for j := 0; j < len(urls); j++ {
			u := urls[j]

			httpWG.Add(1)
			go func(method string, u string, wg *sync.WaitGroup, semaphore chan bool, completed chan bool) {
				defer wg.Done()
				semaphore <- true
				defer func() {
					<-semaphore
				}()
				if isClosed {
					isClosedCh <- true
					return
				}
				var req *http.Request
				if method == "POST" {
					req, _ = http.NewRequest(method, u, strings.NewReader(body.Data))
				}
				if method == "GET" {
					req, _ = http.NewRequest(method, u, nil)
				}
				//不设置UA的话ghttp会设置一个默认UA
				if body.IsCustomHeaders {
					routes.SetHeaders(req, headers)
				}
				var item resultItem
				var client ghttp.Client
				response, err := client.Do(req, ghttp.SetTimeout(time.Duration(body.Timeout)*time.Second))
				if err != nil {
					item.StatusCode = -1
				} else {
					item.StatusCode = response.StatusCode //响应值
					var location, err = response.Location()
					if body.Redirect && response.StatusCode < 400 && response.StatusCode >= 300 && err == nil {
						item.Redirect = location.String()
						req.URL = location
						req.Host = location.Hostname()
						req.Method = "GET"
						response, err = client.Do(req,
							ghttp.SetTimeout(time.Duration(body.Timeout)*time.Second),
							ghttp.EnableRedirect(true))
						if err != nil {
							item.StatusCode = -1
						} else {
							item.ReStatusCode = response.StatusCode
							byteBody, err := ghttp.GetResponseBody(response.Body)
							if err != nil {
								//
							} else {
								charset := getCharsetFromContentType(response.Header.Get("Content-Type"))
								stringBody, err := convertCharset(byteBody, charset)
								if err != nil {
									stringBody = string(byteBody)
								}
								item.ReLength = len(stringBody)
								response.Header.Get("Content-Type")
								re := regexp.MustCompile("(?i)<title>(.*?)</title>")
								matches := re.FindStringSubmatch(stringBody)
								if len(matches) > 1 {
									item.ReTitle = matches[1]
								}
							}
						}
					} else {
						byteBody, err := ghttp.GetResponseBody(response.Body)
						if err != nil {
							//
						} else {
							charset := getCharsetFromContentType(response.Header.Get("Content-Type"))
							stringBody, err := convertCharset(byteBody, charset)
							if err != nil {
								stringBody = string(byteBody)
							}
							item.Length = len(stringBody)
							re := regexp.MustCompile("(?i)<title>(.*?)</title>")
							matches := re.FindStringSubmatch(stringBody)
							if len(matches) > 1 {
								item.Title = matches[1]
							}
						}
					}

				}
				item.Method = req.Method
				item.Url = req.URL.String()
				countLock.Lock()
				currentHttp++
				lastItem = append(lastItem, item)
				// 每满10个返回一次数据 或者每隔5s返回一次进度
				if len(lastItem) == 10 || (len(lastItem) != 10 && time.Now().Sub(startTime) >= 5*time.Second) {
					var r routes.WsOutput
					startTime = time.Now()
					r.Data = lastItem
					r.Message = fmt.Sprintf("当前进度：%.2f%%", (float64(currentHttp)/float64(totalHttp))*100)
					r.Total = totalHttp
					r.HasMore = true
					httpoutput.WsStdOutput(conn, r)
					lastItem = lastItem[:0]
				}
				if currentHttp >= totalHttp {
					completed <- true
				} else {
					completed <- false
				}
				countLock.Unlock()
			}(method,
				u, &httpWG, semaphore, isCompletedCh)

		}
	}
	httpWG.Wait()
}

func getCharsetFromContentType(contentType string) string {
	mediaTypeAndParams := strings.Split(contentType, ";")
	for _, param := range mediaTypeAndParams[1:] {
		paramParts := strings.SplitN(strings.TrimSpace(param), "=", 2)
		if len(paramParts) == 2 && paramParts[0] == "charset" {
			return strings.TrimSpace(paramParts[1])
		}
	}
	return "utf-8"
}

func convertCharset(data []byte, charset string) (string, error) {
	decoder, err := htmlindex.Get(charset)
	if err != nil {
		return "", err
	}

	utf8Reader := decoder.NewDecoder().Reader(strings.NewReader(string(data)))
	decodedData, err := ioutil.ReadAll(utf8Reader)
	if err != nil {
		return "", err
	}

	return string(decodedData), nil
}
