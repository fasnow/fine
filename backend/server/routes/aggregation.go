package routes

import (
	"errors"
	config2 "fine-server/config"
	"fine-server/sdk/fofa"
	"fine-server/sdk/hunter"
	"fine-server/sdk/quake"
	zone2 "fine-server/sdk/zone"
	"fine-server/server/httpoutput"
	"fine-server/server/initialize"
	"fine-server/server/statuscode"
	"fine-server/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/goccy/go-json"
	"github.com/gorilla/websocket"
	"log"
	"math"
	"strconv"
	"strings"
	"sync"
	"time"
)

func AggregateStep1(c *gin.Context) {
	var queryWG sync.WaitGroup
	var isClosed bool
	var toCache AllQueryCacheItem
	uuid := initialize.QueryCache.GenerateUUID()
	conn, err := Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("无法升级为WebSocket连接")))
		log.Println()
		return
	}
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
		}
	}(conn)
	_, msg, err := conn.ReadMessage()
	if err != nil {
		httpoutput.WsErrOutput(conn, statuscode.CodeWsReadError, utils.FormatError(err))
		return
	}
	ip := strings.TrimSpace(string(msg))
	if ip == "" {
		httpoutput.WsErrOutput(conn, statuscode.CodeWsReadError, utils.FormatError(errors.New("IP不满足CIDR格式："+string(ip))))
		return
	}
	toCache.statement = ip
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
	queryWG.Add(4)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var r AllQueryStep1Result
		r.Name = config2.FofaName
		if !config2.CheckAuth(config2.FofaName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeFofaAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		q := "ip=" + ip
		req := fofa.NewGetDataReqBuilder().Query(q).Page(1).Size(1).Full(false).Fields("ip,port,protocol,domain,host,title").Build()
		query1, err := initialize.FofaClient.Get(req)
		if err != nil {
			httpoutput.WsErrOutput(conn, statuscode.CodeFofaQueryError, utils.FormatError(err))
			return
		}
		r.HasMore = true
		r.UUID = uuid
		r.Size = fofaPageSize
		r.Total = query1.Total
		if query1.Total > 10000 {
			toCache.fofaAvailablePage = int(math.Floor(float64(10000) / float64(fofaPageSize)))
			r.MaxPage = toCache.fofaAvailablePage
		} else {
			toCache.fofaAvailablePage = int(math.Ceil(float64(query1.Total) / float64(fofaPageSize)))
			r.MaxPage = toCache.fofaAvailablePage
		}
		httpoutput.WsStdOutput(conn, r)
	}(&queryWG)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var r AllQueryStep1Result
		r.Name = config2.HunterName
		if !config2.CheckAuth(config2.HunterName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeHunterAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		q := "ip=" + ip
		req := hunter.NewGetDataReqBuilder().Query(q).Page(1).Size(1).IsWeb(3).Build()
		query2, err := initialize.HunterClient.Get(req)
		if err != nil {
			httpoutput.WsErrOutput(conn, statuscode.CodeHunterQueryError, utils.FormatError(err))
			return
		}
		r.Token = query2.RestQuota
		r.UUID = uuid
		r.HasMore = true
		r.Size = hunterPageSize
		r.Total = query2.Total
		toCache.hunterAvailablePage = int(math.Ceil(float64(query2.Total) / float64(hunterPageSize)))
		r.MaxPage = toCache.hunterAvailablePage
		httpoutput.WsStdOutput(conn, r)
	}(&queryWG)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var r AllQueryStep1Result
		r.Name = config2.ZoneName
		if !config2.CheckAuth(config2.ZoneName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeZoneAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		q := "ip=" + ip
		req := zone2.NewGetDataReqBuilder().Query(q).Page(1).Size(1).Build()
		query3, err := initialize.ZoneClient.Site.Get(req)
		if err != nil {
			httpoutput.WsErrOutput(conn, statuscode.CodeZoneQueryError, utils.FormatError(err))
			return
		}
		r.HasMore = true
		r.Size = zonePageSize
		r.Total = query3.Total
		r.UUID = uuid
		toCache.zoneAvailablePage = int(math.Ceil(float64(query3.Total) / float64(zonePageSize)))
		r.MaxPage = toCache.zoneAvailablePage
		httpoutput.WsStdOutput(conn, r)
	}(&queryWG)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var r AllQueryStep1Result
		r.Name = config2.QuakeName
		if !config2.CheckAuth(config2.QuakeName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeQuakeAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		q := "ip:" + ip
		req := quake.NewGetRealtimeDataBuilder().Query(q).Page(1).Size(1).Build()
		query4, err := initialize.QuakeClient.Realtime.Service(req)
		if err != nil {
			httpoutput.WsErrOutput(conn, statuscode.CodeQuakeQueryError, utils.FormatError(err))
			return
		}
		total := query4.Total
		user, err := initialize.QuakeClient.User()
		r.Token = user.Credit
		r.HasMore = true
		r.Size = quakePageSize
		r.Total = total
		r.UUID = uuid
		toCache.quakeAvailablePage = int(math.Ceil(float64(total) / float64(quakePageSize)))
		r.MaxPage = toCache.quakeAvailablePage
		httpoutput.WsStdOutput(conn, r)
	}(&queryWG)
	queryWG.Wait()
	if isClosed {
		return
	}
	initialize.QueryCache.Set(uuid, toCache, initialize.DefaultCacheTimeout)
	var r AllQueryStep1Result
	r.HasMore = false
	if toCache.fofaAvailablePage > 0 || toCache.quakeAvailablePage > 0 || toCache.zoneAvailablePage > 0 || toCache.hunterAvailablePage > 0 {
		r.UUID = uuid
	}
	httpoutput.WsStdOutput(conn, r)
}

func AggregateStep2(c *gin.Context) {
	var cacheContent AllQueryCacheItem
	var params AllQueryStep2Params
	var queryWG sync.WaitGroup
	var httpWG sync.WaitGroup
	var oldItems []AllQueryStep2ResultItem
	var newItems []AllQueryStep2ResultItem
	var exist = true
	var startTime time.Time
	var r WsOutput
	currentPage := 0
	totalHttp := 0
	currentHttp := 0
	isClosed := false
	countLock := &sync.Mutex{}
	conn, err := Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		httpoutput.HttpErrOutput(c, statuscode.CodeOtherError, utils.FormatError(errors.New("无法升级为WebSocket连接")))
		return
	}
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
		}
	}(conn)
	_, msg, err := conn.ReadMessage()
	if err != nil {
		httpoutput.WsErrOutput(conn, statuscode.CodeWsReadError, utils.FormatError(errors.New("无法处理："+err.Error())))
		return
	}
	err = json.Unmarshal(msg, &params)
	if err != nil {
		httpoutput.WsErrOutput(conn, statuscode.CodeNotJsonFormatError, utils.FormatError(errors.New("无法处理："+err.Error())))
		return
	}
	if params.UUID == "" {
		httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("uuid为空")))
		return
	}
	if val, ok := initialize.QueryCache.Get(params.UUID); ok {
		// 使用类型断言将接口类型转换为字符串类型
		if cacheContent, ok = val.(AllQueryCacheItem); !ok {
			httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("重新查询后再执行导出")))
			return
		}
	} else {
		httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("重新查询后再执行导出")))
		return
	}
	ip := cacheContent.statement
	if ip == "" {
		httpoutput.WsErrOutput(conn, statuscode.CodeOtherError, utils.FormatError(errors.New("请先执行第一步")))
		return
	}
	if params.FofaMaxPage > cacheContent.fofaAvailablePage {
		params.FofaMaxPage = cacheContent.fofaAvailablePage
	}
	if params.QuakeMaxPage > cacheContent.quakeAvailablePage {
		params.QuakeMaxPage = cacheContent.quakeAvailablePage
	}
	if params.ZoneMaxPage > cacheContent.zoneAvailablePage {
		params.ZoneMaxPage = cacheContent.zoneAvailablePage
	}
	if params.HunterMaxPage > cacheContent.hunterAvailablePage {
		params.HunterMaxPage = cacheContent.hunterAvailablePage
	}
	totalPage := params.QuakeMaxPage + params.ZoneMaxPage + params.HunterMaxPage + params.FofaMaxPage
	if totalPage == 0 {
		r = WsOutput{}
		r.HasMore = false
		r.Total = 0
		r.Message = "至少查询一个有效页"
		httpoutput.WsStdOutput(conn, r)
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
	queryWG.Add(4)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var temp []AllQueryStep2ResultItem
		var r WsOutput
		if !config2.CheckAuth(config2.FofaName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeFofaAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		for page := 1; page <= params.FofaMaxPage && page*fofaPageSize <= 10000; page++ {
			q := "ip=" + ip
			req := fofa.NewGetDataReqBuilder().Query(q).Page(page).Size(fofaPageSize).Full(false).Fields("ip,port,protocol,domain,host,title").Build()
			query1, err := initialize.FofaClient.Get(req)
			if err != nil {
				httpoutput.WsErrOutput(conn, statuscode.CodeFofaQueryError, utils.FormatError(err))
				break
			}
			total := query1.Total
			if total != 0 {
				for i := 0; i < len(query1.Items); i++ {
					//var tmp AllQueryStep2ResultItem
					//tmp.Ip = (*query1.Items[i])["ip"]
					//tmp.Port = (*query1.Items[i])["port"]
					//tmp.Protocol = (*query1.Items[i])["protocol"]
					//tmp.Domain = (*query1.Items[i])["domain"]
					//tmp.Host = (*query1.Items[i])["host"]
					//tmp.Title = (*query1.Items[i])["title"]
					//temp = append(temp, tmp)
					//if len(temp) == 10 {
					//	oldItems = append(oldItems, temp...)
					//	temp = temp[:0]
					//}
				}
				oldItems = append(oldItems, temp...)
			}
			countLock.Lock()
			currentPage++
			r.HasMore = true
			r.Message = fmt.Sprintf("已获取数据：%.2f%%", (float64(currentPage)/float64(totalPage))*100)
			countLock.Unlock()
			httpoutput.WsStdOutput(conn, r)
		}
	}(&queryWG)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var temp []AllQueryStep2ResultItem
		var r WsOutput
		if !config2.CheckAuth(config2.HunterName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeHunterAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		for page := 1; page <= params.HunterMaxPage; page++ {
			q := "ip=" + ip
			req := hunter.NewGetDataReqBuilder().Query(q).Page(page).Size(hunterPageSize).IsWeb(3).Build()
			query2, err := initialize.HunterClient.Get(req)
			if err != nil {
				httpoutput.WsErrOutput(conn, statuscode.CodeHunterQueryError, utils.FormatError(err))
				break
			}
			total := query2.Total
			if total != 0 {
				var tmp AllQueryStep2ResultItem
				for i := 0; i < len(query2.Data); i++ {
					tmp.Ip = query2.Data[i].IP
					tmp.Port = strconv.Itoa(query2.Data[i].Port)
					tmp.Protocol = query2.Data[i].Protocol
					tmp.Domain = query2.Data[i].Domain
					tmp.Host = query2.Data[i].URL
					tmp.Title = query2.Data[i].WebTitle
					temp = append(temp, tmp)
					if len(temp) == 10 {
						oldItems = append(oldItems, temp...)
						temp = temp[:0]
					}
				}
				oldItems = append(oldItems, temp...)
			}
			countLock.Lock()
			currentPage++
			r.HasMore = true
			r.Message = fmt.Sprintf("已获取数据：%.2f%%", (float64(currentPage)/float64(totalPage))*100)
			countLock.Unlock()
			httpoutput.WsStdOutput(conn, r)
			time.Sleep(2 * time.Second)
		}
	}(&queryWG)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var temp []AllQueryStep2ResultItem
		var r WsOutput
		if !config2.CheckAuth(config2.ZoneName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeZoneAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		for page := 1; page <= params.ZoneMaxPage; page++ {
			q := "ip=" + ip
			req := zone2.NewGetDataReqBuilder().Query(q).Page(page).Size(zonePageSize).Build()
			query3, err := initialize.ZoneClient.Site.Get(req)
			if err != nil {
				httpoutput.WsErrOutput(conn, statuscode.CodeZoneQueryError, utils.FormatError(err))
				break
			}
			if query3.Total != 0 {
				var tmp AllQueryStep2ResultItem
				var data []*zone2.SiteItem
				marshal, err := json.Marshal(query3.Data)
				if err != nil {
					return
				}
				json.Unmarshal(marshal, &data)
				for i := 0; i < len(data); i++ {
					tmp.Ip = data[i].IP
					tmp.Port = data[i].Port
					tmp.Protocol = data[i].Service
					tmp.Host = data[i].URL
					if strings.HasPrefix(data[i].URL, "https://") {
						tmp.Host = data[i].URL[8:]
					} else if strings.HasPrefix(data[i].URL, "http://") {
						tmp.Host = data[i].URL[7:]
					}
					temp = append(temp, tmp)
					if len(temp) == 10 {
						oldItems = append(oldItems, temp...)
						temp = temp[:0]
					}
				}
				oldItems = append(oldItems, temp...)
			}
			countLock.Lock()
			currentPage++
			r.HasMore = true
			r.Message = fmt.Sprintf("已获取数据：%.2f%%", (float64(currentPage)/float64(totalPage))*100)
			countLock.Unlock()
			httpoutput.WsStdOutput(conn, r)
			time.Sleep(500 * time.Millisecond)
		}
	}(&queryWG)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		var temp []AllQueryStep2ResultItem
		var r WsOutput
		if !config2.CheckAuth(config2.QuakeName) {
			httpoutput.WsErrOutput(conn, statuscode.CodeQuakeAuthError, utils.FormatError(errors.New("未配置认证信息")))
			return
		}
		for page := 1; page <= params.QuakeMaxPage; page++ {
			q := "ip:" + ip
			req := quake.NewGetRealtimeDataBuilder().Query(q).Page(page).Size(quakePageSize).Build()
			query4, err := initialize.QuakeClient.Realtime.Service(req)
			if err != nil {
				httpoutput.WsErrOutput(conn, statuscode.CodeQuakeQueryError, utils.FormatError(err))
				break
			}
			total := int(query4.Total)
			if total != 0 {
				var tmp AllQueryStep2ResultItem
				for i := 0; i < len(query4.Data); i++ {
					tmp.Ip = query4.Data[i].IP
					tmp.Port = strconv.Itoa(query4.Data[i].Port)
					tmp.Protocol = query4.Data[i].Service.Name
					tmp.Host = query4.Data[i].Service.HTTP.Host
					tmp.Domain = query4.Data[i].Domain
					tmp.Title = query4.Data[i].Service.HTTP.Title
					temp = append(temp, tmp)
					if len(temp) == 10 {
						oldItems = append(oldItems, temp...)
						temp = temp[:0]
					}
				}
				oldItems = append(oldItems, temp...)
			}
			countLock.Lock()
			currentPage++
			r.HasMore = true
			r.Message = fmt.Sprintf("已获取数据：%.2f%%", (float64(currentPage)/float64(totalPage))*100)
			countLock.Unlock()
			httpoutput.WsStdOutput(conn, r)
			time.Sleep(500 * time.Millisecond)
		}
	}(&queryWG)
	queryWG.Wait()
	r.Message = "正在去重..."
	r.HasMore = true
	httpoutput.WsStdOutput(conn, r)
	//去重：ip port host不为空且相同则为重复，ip带*则为唯一
	startTime = time.Now()
	for i := 0; i < len(oldItems); i++ {
		exist = false
		for j := 0; j < len(newItems); j++ {
			if i == j {
				continue
			}
			if strings.HasSuffix(oldItems[i].Ip, "*") {
				exist = false
				break
			}
			if oldItems[i].Ip == oldItems[j].Ip && oldItems[i].Port == oldItems[j].Port && oldItems[i].Host == oldItems[j].Host {
				exist = true
				break
			}
		}
		if !exist {
			newItems = append(newItems, oldItems[i])
		}
		if time.Now().Sub(startTime) >= 1*time.Second {
			// 每隔1s返回一次进度
			startTime = time.Now()
			r.HasMore = true
			r.Message = fmt.Sprintf("正在去重：%.2f%%", (float64(i)/float64(len(oldItems)))*100)
			httpoutput.WsStdOutput(conn, r)
		}
	}
	r.Message = "正在获取网页响应码..."
	r.HasMore = true
	httpoutput.WsStdOutput(conn, r)
	// 获取响应码：
	semaphore := make(chan bool, 10) // 协程数量
	var t []AllQueryStep2ResultItem
	totalHttp = len(newItems)
	startTime = time.Now()
	isCompleted := make(chan bool, 1)
	isClosedCh := make(chan bool, 1)
	for i := 0; i < totalHttp; i++ {
		httpWG.Add(1)
		go func(item AllQueryStep2ResultItem, wg *sync.WaitGroup, semaphore chan bool, completed chan bool) {
			defer wg.Done()
			semaphore <- true
			defer func() {
				<-semaphore
			}()
			if isClosed {
				isClosedCh <- true
				return
			}
			if !strings.HasPrefix(item.Protocol, "http") { //不处理非http协议
				countLock.Lock()
				currentHttp++
				t = append(t, item)
				// 每满10个返回一次数据 或者每隔5s返回一次进度
				if len(t) == 10 || (len(t) != 10 && time.Now().Sub(startTime) >= 5*time.Second) {
					var r WsOutput
					startTime = time.Now()
					r.Data = t
					r.HasMore = true
					r.Total = len(newItems)
					r.Message = fmt.Sprintf("已获取网页响应码：%.2f%%", (float64(currentHttp)/float64(totalHttp))*100)
					httpoutput.WsStdOutput(conn, r)
					t = t[:0]
				}
				countLock.Unlock()
				//newItem <- item
				return
			}
			port := 0
			//去掉schema
			if strings.HasPrefix(item.Host, "https://") {
				index := strings.Index(item.Host, "https://")
				if index != -1 {
					item.Host = item.Host[index+8:]
				}
			} else if strings.HasPrefix(item.Host, "http://") {
				index := strings.Index(item.Host, "http://")
				if index != -1 {
					item.Host = item.Host[index+7:]
				}
			}
			index := strings.Index(item.Host, ":")
			if index != -1 {
				port, _ = strconv.Atoi(item.Host[index+1:])
				item.Host = item.Host[0:index]
			}
			if item.Port == "443" {
				if item.Host != "" {
					u := "https://" + item.Host + ":443"
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
				}
				if (item.Host == "" || item.StatusCode == "无法访问") && !strings.HasSuffix(item.Ip, "*") {
					u := "https://" + item.Ip + ":443"
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
				}
			} else if item.Port == "80" {
				if item.Host != "" {
					u := "http://" + item.Host + ":80"
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
				}
				if (item.Host == "" || item.StatusCode == "无法访问") && !strings.HasSuffix(item.Ip, "*") {
					u := "http://" + item.Ip + ":80"
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
				}
			} else if item.Port == "" {
				if item.Host != "" {
					u := "https://" + item.Host + ":443"
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
					if item.StatusCode == "无法访问" {
						u := "http://" + item.Host + ":80"
						code, title, err := utils.GetCodeAndTitle(u)
						if err != nil {
							item.StatusCode = err.Error()
						} else {
							item.StatusCode = u + " | " + strconv.Itoa(code)
							item.Title = title
						}
					}
				}
				if (item.Host == "" || item.StatusCode == "无法访问") && !strings.HasSuffix(item.Ip, "*") {
					u := "https://" + item.Ip + ":443"
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
					if item.StatusCode == "无法访问" {
						u := "http://" + item.Ip + ":80"
						code, title, err := utils.GetCodeAndTitle(u)
						if err != nil {
							item.StatusCode = err.Error()
						} else {
							item.StatusCode = u + " | " + strconv.Itoa(code)
							item.Title = title
						}
					}
				}
			} else {
				if item.Host != "" {
					u := "https://" + item.Host + ":" + item.Port
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
					if item.StatusCode == "无法访问" {
						u := "http://" + item.Host + ":" + item.Port
						code, title, err := utils.GetCodeAndTitle(u)
						if err != nil {
							item.StatusCode = err.Error()
						} else {
							item.StatusCode = u + " | " + strconv.Itoa(code)
							item.Title = title
						}
					}
				}
				if (item.Host == "" || item.StatusCode == "无法访问") && !strings.HasSuffix(item.Ip, "*") {
					u := "https://" + item.Ip + ":" + item.Port
					code, title, err := utils.GetCodeAndTitle(u)
					if err != nil {
						item.StatusCode = err.Error()
					} else {
						item.StatusCode = u + " | " + strconv.Itoa(code)
						item.Title = title
					}
					if item.StatusCode == "无法访问" {
						u := "http://" + item.Ip + ":" + item.Port
						code, title, err := utils.GetCodeAndTitle(u)
						if err != nil {
							item.StatusCode = err.Error()
						} else {
							item.StatusCode = u + " | " + strconv.Itoa(code)
							item.Title = title
						}
					}
				}
			}

			//重新把端口加给host
			if item.Host != "" && port != 0 {
				item.Host += ":" + strconv.Itoa(port)
			}

			countLock.Lock()
			currentHttp++
			t = append(t, item)
			// 每满10个返回一次数据 或者每隔5s返回一次进度
			if len(t) == 10 || (len(t) != 10 && time.Now().Sub(startTime) >= 5*time.Second) {
				var r WsOutput
				startTime = time.Now()
				r.Data = t
				r.HasMore = true
				r.Total = len(newItems)
				r.Message = fmt.Sprintf("已获取网页响应码：%.2f%%", (float64(currentHttp)/float64(totalHttp))*100)
				httpoutput.WsStdOutput(conn, r)
				t = t[:0]
			}
			if currentHttp >= totalHttp {
				completed <- true
			} else {
				completed <- false
			}
			countLock.Unlock()
			//fmt.Println("conn |" + conn.RemoteAddr().String() + "|总共/：当前" + strconv.Itoa(totalHttp) + "/" + strconv.Itoa(currentHttp))
			//fmt.Println(item)
			//newItem <- item
		}(newItems[i], &httpWG, semaphore, isCompleted)
		//newItems[i] = <-ch
	}
	//发送最后一段结果
	httpWG.Add(1)
	go func(ch chan bool) {
		defer httpWG.Done()
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
			case completed = <-ch:
				if completed {
					r = WsOutput{}
					r.Data = t
					r.HasMore = false
					r.Total = len(newItems)
					r.Message = "数据全部处理完毕"
					httpoutput.WsStdOutput(conn, r)
					return
				}
			case stopped := <-isClosedCh:
				if stopped {
					r := WsOutput{}
					r.HasMore = false
					r.Total = len(newItems)
					r.Message = "已中止"
					httpoutput.WsStdOutput(conn, r)
					return
				}
			}
			//}
		}
	}(isCompleted)
	httpWG.Wait()
}
