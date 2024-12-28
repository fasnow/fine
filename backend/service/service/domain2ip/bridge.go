package domain2ip

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/constant"
	"fine/backend/logger"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"net"
	"sort"
	"strconv"
	"sync"
	"time"
)

type Bridge struct {
	app       *app.App
	ip2domain *IP2Domain
}

func NewDomain2IPBridge(app *app.App) *Bridge {
	t := NewClient()
	t.UseProxyManager(config.ProxyManager)
	return &Bridge{
		app:       app,
		ip2domain: t,
	}
}

var cache = utils.NewCache() //存储正在运行的任务
var wg sync.WaitGroup
var semaphore = make(chan struct{}, 3) // 限制并发的通道

type Detail struct {
	Domain  string     `json:"domain"`
	TaskID  int64      `json:"taskID"`
	CNAMEs  []string   `json:"cnames"`
	IPs     []IPDetail `json:"ips"`
	IsCDN   bool       `json:"isCDN"`
	Error   string     `json:"error"`
	Message string     `json:"message"`
}

func (b *Bridge) GetDetail(domains []string) int64 {
	domains = utils.RemoveEmptyAndDuplicateString(domains)

	//任务缓存控制
	taskID := idgen.NextId()
	taskIDStr := strconv.FormatInt(taskID, 10)
	cache.Set(taskIDStr, false, 9999*time.Hour)

	go func() {
		defer func() {
			cache.Delete(taskIDStr)
			constant.Emit(constant.Events.Domain2IPDown, Detail{TaskID: taskID})
		}()
		dnss := config.GlobalConfig.DNS.Value
		var details []Detail
		for _, domain := range domains {
			semaphore <- struct{}{} // 往通道中放入信号量
			wg.Add(1)
			go func(domain string) {
				defer func() {
					<-semaphore
					wg.Done()
				}() // 任务完成后释放通道中的信号量

				//用于终止任务
				t, ok := cache.Get(taskIDStr)
				if !ok {
					return
				}
				if needTerminal, ok := t.(bool); ok && needTerminal {
					return
				}

				var cnames []string
				for _, d := range dnss {
					tt, err := b.ip2domain.GetCNAMERecord(domain, d+":53")
					if err != nil {
						ttt := fmt.Sprintf("%s get CNAME record using dns %s :%v", domain, d, err)
						logger.Info(ttt)
						constant.Emit(constant.Events.Domain2IPOutput, Detail{
							TaskID: taskID,
							Domain: domain,
							Error:  ttt,
						})
						continue
					}
					cnames = tt
					logger.Info(domain, tt)
					break
				}
				var isCDN bool
				if len(cnames) > 0 {
					isCDN = b.ip2domain.IsCDN(domain, cnames[0])
				}
				var aRecords []string
				for _, d := range dnss {
					tt, err := b.ip2domain.GetARecord(domain, d+":53")
					if err != nil {
						ttt := fmt.Sprintf("%s get A record using dns %s :%v", domain, d, err)
						logger.Info(ttt)
						constant.Emit(constant.Events.Domain2IPOutput, Detail{
							TaskID: taskID,
							Domain: domain,
							Error:  ttt,
						})
						continue
					}
					aRecords = tt
					logger.Info(tt)
					break
				}
				var ipDetails []IPDetail
				for _, aRecord := range aRecords {
					ipDetails = append(ipDetails, IPDetail{Addr: aRecord})
				}
				if isCDN {
					detail := Detail{
						Domain: domain,
						TaskID: taskID,
						CNAMEs: cnames,
						IPs:    ipDetails,
						IsCDN:  isCDN,
					}
					constant.Emit(constant.Events.Domain2IPOutput, detail)
					logger.Info(detail)
					return
				}
				for i, ipDetail := range ipDetails {
					tt, err := b.ip2domain.GetIPDetail(ipDetail.Addr)
					if err != nil {
						logger.Info(err)
						continue
					}
					ipDetails[i].Area = tt.Area
					ipDetails[i].Provider = tt.Provider
					ipDetails[i].Country = tt.Country
					logger.Info(ipDetails[i])
					time.Sleep(300 * time.Millisecond)
				}
				detail := Detail{
					Domain: domain,
					TaskID: taskID,
					CNAMEs: cnames,
					IPs:    ipDetails,
					IsCDN:  isCDN,
				}
				constant.Emit(constant.Events.Domain2IPOutput, detail)
				logger.Info(detail)
				details = append(details, detail)
			}(domain)
		}
		wg.Wait()

		//整理成C段
		var ips []string
		for _, detail := range details {
			for _, ipDetails := range detail.IPs {
				if detail.IsCDN {
					continue
				}
				ips = append(ips, ipDetails.Addr)
			}
		}

		//统计各个C段的IP数量
		countMap := make(map[string]int)
		for _, ipStr := range ips {
			ip := net.ParseIP(ipStr)
			if ip != nil {
				cidr := ip.Mask(net.CIDRMask(24, 32)) // 将IP地址转换成C段
				countMap[cidr.String()]++
			}
		}

		// 将统计结果按照C段排序
		var keys []string
		for key := range countMap {
			keys = append(keys, key)
		}
		sort.Strings(keys)

		tt := make(map[string]int)
		for _, key := range keys {
			tt[key+"/24"] = countMap[key]
		}
		ttt := map[string]any{
			"taskID": taskID,
			"data":   tt,
		}
		logger.Info(ttt)
		constant.Emit(constant.Events.Domain2IPOutput, ttt)
	}()
	return taskID
}

func (b *Bridge) Stop(taskID int64) error {
	taskIDStr := strconv.Itoa(int(taskID))
	value, ok := cache.Get(taskIDStr)
	if !ok {
		logger.Info("无效taskID")
		return errors.New("无效taskID")
	}
	if v, ok := value.(bool); ok && v {
		cache.Update(taskIDStr, true)
	}
	return nil
}
