package wechat

import (
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/status"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/proxy/v2"
	"fine/backend/service/model/wechat"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	runtime2 "runtime"
	"strconv"
	"strings"
	"sync"
	"time"
)

var filteredFileExt = []string{".png", ".jpg", ".jpeg", ".wxapkg", ".br"}

type Bridge struct {
	app                      *application.Application
	wxRepo                   repository.WechatRepository
	http                     *http.Client
	regexMap                 sync.Map
	wechat                   *WeChat
	mutex                    sync.Mutex
	autoDecompile            bool
	decompileConcurrencyChan chan struct{}
	extractConcurrencyChan   chan struct{}
	decompileStatusChan      chan struct {
		Task *models.VersionDecompileTask
		Stat int
		Err  error
		Msg  string
	}
	extractStatusChan chan struct {
		Task *models.VersionDecompileTask
		Stat int
		Err  error
		Msg  string
	}
	miniAPPInfoChan                 chan wechat.Info
	queryMiniAPPInfoConcurrencyChan chan struct{}
}

func (r *Bridge) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
	r.wechat.UseProxyManager(manager)
}

func NewBridge(app *application.Application) *Bridge {
	c := &Bridge{
		app:                      app,
		wxRepo:                   repository.NewWechatRepository(database.GetConnection()),
		http:                     &http.Client{},
		wechat:                   New(app.Config.Wechat.Applet),
		decompileConcurrencyChan: make(chan struct{}, app.Config.Wechat.DecompileConcurrency),
		extractConcurrencyChan:   make(chan struct{}, app.Config.Wechat.ExtractConcurrency),
		decompileStatusChan: make(chan struct {
			Task *models.VersionDecompileTask
			Stat int
			Err  error
			Msg  string
		}, 1),
		extractStatusChan: make(chan struct {
			Task *models.VersionDecompileTask
			Stat int
			Err  error
			Msg  string
		}, 1),
		miniAPPInfoChan:                 make(chan wechat.Info, 5),
		queryMiniAPPInfoConcurrencyChan: make(chan struct{}, 3),
	}
	c.SetRegex(app.Config.Wechat.Rules)
	c.wxRepo.RestVersionTaskStatus()
	c.UseProxyManager(app.ProxyManager)
	c.fileMonitor()
	return c
}

func (r *Bridge) SetRegex(regexes []string) {
	r.wechat.SetRegex(regexes)
}

// 创建版本任务
func (r *Bridge) createVersionTasks(miniProgram *wechat.MiniProgram) []*models.VersionDecompileTask {
	var versionsTask []*models.VersionDecompileTask
	for _, version := range miniProgram.Versions {
		versionsTask = append(versionsTask, &models.VersionDecompileTask{
			AppID:           miniProgram.AppID,
			DecompileStatus: status.Waiting,
			MatchStatus:     status.Waiting,
			Version: &wechat.Version{
				Number:     version.Number,
				UpdateDate: version.UpdateDate,
			},
		})
	}
	return versionsTask
}

// 创建版本任务状态
func (r *Bridge) createVersionTaskStatuses(versions []*models.VersionDecompileTask) []*wechat.VersionTaskStatus {
	var statuses []*wechat.VersionTaskStatus
	for _, version := range versions {
		statuses = append(statuses, &wechat.VersionTaskStatus{
			Number:          version.Version.Number,
			DecompileStatus: version.DecompileStatus,
			MatchStatus:     version.MatchStatus,
		})
	}
	return statuses
}

// 查找或创建信息
func (r *Bridge) findOrCreateInfo(appID string) (*wechat.Info, error) {
	appInfo, err := r.wxRepo.FindInfoByAppID(appID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			go func() {
				r.queryMiniAPPInfoConcurrencyChan <- struct{}{}
				defer func() {
					time.Sleep(1 * time.Second)
					<-r.queryMiniAPPInfoConcurrencyChan
				}()
				mimiAPPInfo, e := r.wechat.QueryMimiAPPInfo(appID)
				if e != nil {
					r.app.Logger.Error(e)
					return
				}
				if err2 := r.wxRepo.CreateInfo(&models.Info{
					Info: &wechat.Info{
						Nickname:      mimiAPPInfo.Nickname,
						Username:      mimiAPPInfo.Username,
						Description:   mimiAPPInfo.Description,
						Avatar:        mimiAPPInfo.Avatar,
						UsesCount:     mimiAPPInfo.UsesCount,
						PrincipalName: mimiAPPInfo.PrincipalName,
						AppID:         appID,
					},
				}); err2 != nil {
					r.app.Logger.Error(e)
					return
				}
				r.miniAPPInfoChan <- *mimiAPPInfo
			}()
			return nil, nil
		}
		return nil, err
	}
	return &wechat.Info{
		Nickname:      appInfo.Nickname,
		Username:      appInfo.Username,
		Description:   appInfo.Description,
		Avatar:        appInfo.Avatar,
		UsesCount:     appInfo.UsesCount,
		PrincipalName: appInfo.PrincipalName,
		AppID:         appID,
	}, nil
}

// 处理版本任务
func (r *Bridge) handleVersionTasks(appID string, versionsTask []*models.VersionDecompileTask) ([]*wechat.VersionTaskStatus, error) {
	task, err := r.wxRepo.FindTaskByAppId(appID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err2 := r.wxRepo.CreateVersionTask(&models.MiniAppDecompileTask{
				MiniAppBaseInfo: &wechat.MiniAppBaseInfo{AppID: appID},
				Versions:        versionsTask,
			}); err2 != nil {
				return nil, err2
			}
			return r.createVersionTaskStatuses(versionsTask), nil
		}
		return nil, err
	}
	versionMap := make(map[string]*models.VersionDecompileTask)
	for _, version := range task.Versions {
		versionMap[version.Version.Number] = version
	}
	var newVersionsTask []*models.VersionDecompileTask
	var statuses []*wechat.VersionTaskStatus
	for _, versionTask := range versionsTask {
		if existingVersion, ok := versionMap[versionTask.Version.Number]; ok {
			statuses = append(statuses, &wechat.VersionTaskStatus{
				Number:          existingVersion.Version.Number,
				DecompileStatus: existingVersion.DecompileStatus,
				MatchStatus:     existingVersion.MatchStatus,
				Message:         existingVersion.Message,
			})
		} else {
			newVersionsTask = append(newVersionsTask, versionTask)
			statuses = append(statuses, &wechat.VersionTaskStatus{
				Number:          versionTask.Version.Number,
				DecompileStatus: status.Waiting,
				MatchStatus:     status.Waiting,
			})
		}
	}
	if len(newVersionsTask) > 0 {
		if err2 := r.wxRepo.AppendVersionTaskByAppID(newVersionsTask); err2 != nil {
			return nil, err2
		}
	}
	return statuses, nil
}

func (r *Bridge) getDecryptedWxapkgs(appid, version string) (map[string][]byte, error) {
	wxapkgs, err := r.wechat.GetMiniAppWxapkgs(appid, version)
	if err != nil {
		return nil, err
	}
	result := make(map[string][]byte, 0)
	for _, wxapkg := range wxapkgs {
		bytes, err := os.ReadFile(wxapkg)
		if err != nil {
			return nil, err
		}
		if runtime2.GOOS == "windows" {
			bytes, err = r.wechat.DecryptWxapkg(bytes, appid, DefaultSalt, DefaultIV)
			if err != nil {
				return nil, err
			}
		}
		result[wxapkg] = bytes
	}
	return result, nil
}

func (r *Bridge) decompile(task *models.VersionDecompileTask) []string {
	var wg sync.WaitGroup
	var resultFiles []string
	wg.Add(1)
	go func() {
		defer wg.Done()
		r.decompileStatusChan <- struct {
			Task *models.VersionDecompileTask
			Stat int
			Err  error
			Msg  string
		}{Task: task, Stat: status.Running, Err: nil, Msg: "反编译中"}
		wxapkgMap, err := r.getDecryptedWxapkgs(task.AppID, task.Number)
		if err != nil {
			r.app.Logger.Error(err)
			r.decompileStatusChan <- struct {
				Task *models.VersionDecompileTask
				Stat int
				Err  error
				Msg  string
			}{Task: task, Stat: status.Error, Err: err, Msg: fmt.Sprintf("获取/解密wxapkg文件出错: %s", err.Error())}
			return
		}
		for filename, bytes := range wxapkgMap {
			baseFilename := filepath.Base(filename)
			dir := filepath.Join(r.app.Config.WechatDataDir, task.AppID, task.Number, baseFilename[0:len(baseFilename)-7])
			files, err := r.wechat.UnpackWxapkg(bytes, dir, nil)
			if err != nil {
				r.app.Logger.Error(err)
				r.decompileStatusChan <- struct {
					Task *models.VersionDecompileTask
					Stat int
					Err  error
					Msg  string
				}{Task: task, Stat: status.Error, Err: err, Msg: fmt.Sprintf("反编译出错: %s", err.Error())}
				continue
			}
			resultFiles = append(resultFiles, files...)
		}
		r.decompileStatusChan <- struct {
			Task *models.VersionDecompileTask
			Stat int
			Err  error
			Msg  string
		}{Task: task, Stat: status.Stopped, Err: nil, Msg: "反编译结束"}
	}()
	wg.Wait()
	return resultFiles
}

func (r *Bridge) emitDecompileStatus(task *models.VersionDecompileTask, stat int, err error, msg string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	data := map[string]string{
		"AppID":   task.AppID,
		"Version": task.Version.Number,
	}
	task.DecompileStatus = stat
	task.Message = msg
	if err := r.wxRepo.UpdateVersionTask(task); err != nil {
		r.app.Logger.Error(err)
	}
	eventDetail := event.EventDetail{
		Status:  stat,
		Message: fmt.Sprintf("%s\n", msg),
		Data:    data,
	}
	if err != nil {
		eventDetail.Error = err.Error()
	}
	event.EmitV2(event.DecompileWxMiniAPP, eventDetail)
}

func (r *Bridge) emitExtractInfoStatus(task *models.VersionDecompileTask, stat int, err error, msg string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	data := map[string]string{
		"AppID":   task.AppID,
		"Version": task.Version.Number,
	}
	task.MatchStatus = stat
	task.Message = msg
	if err := r.wxRepo.UpdateVersionTask(task); err != nil {
		r.app.Logger.Error(err)
	}
	eventDetail := event.EventDetail{
		Status:  stat,
		Message: fmt.Sprintf("%s\n", msg),
		Data:    data,
	}
	if err != nil {
		eventDetail.Error = err.Error()
	}
	event.EmitV2(event.DecompileWxMiniAPP, eventDetail)
}

func (r *Bridge) fileMonitor() {
	go func() {
		ticker := time.NewTicker(3 * time.Second)
		for {
			select {
			case <-ticker.C:
				miniApps, err := r.GetAllMiniApp()
				if err != nil {
					continue
				}
				if r.autoDecompile {
					r.decompileBulk(miniApps)
				}
				event.EmitV2(event.DecompileWxMiniAPPTicker, event.EventDetail{
					Status: status.Running,
					Data:   miniApps,
				})
			case data := <-r.decompileStatusChan:
				r.emitDecompileStatus(data.Task, data.Stat, data.Err, data.Msg)
			case data := <-r.extractStatusChan:
				r.emitExtractInfoStatus(data.Task, data.Stat, data.Err, data.Msg)
			case info := <-r.miniAPPInfoChan:
				event.EmitV2(event.DecompileWxMiniAPPInfoTicker, event.EventDetail{
					Status: status.Running,
					Data:   info,
				})
			}
		}
	}()
}

func (r *Bridge) extractInfo(task *models.VersionDecompileTask, files []string) {
	go func() {
		r.extractStatusChan <- struct {
			Task *models.VersionDecompileTask
			Stat int
			Err  error
			Msg  string
		}{Task: task, Stat: status.Running, Err: nil, Msg: "敏感信息提取中"}
		var results []string
		for _, file := range files {
			// 跳过指定后缀本文件
			if utils.StringSliceContain(filteredFileExt, filepath.Ext(file)) {
				continue
			}

			bytes, err := os.ReadFile(file)
			if err != nil {
				continue
			}
			t := r.wechat.ExtractInfo(string(bytes))
			results = append(results, t...)
		}
		results = utils.RemoveEmptyAndDuplicateString(results)
		task.Matched = strings.Join(results, "\n")
		r.extractStatusChan <- struct {
			Task *models.VersionDecompileTask
			Stat int
			Err  error
			Msg  string
		}{Task: task, Stat: status.Stopped, Err: nil, Msg: "敏感信息提取完成"}
	}()
}

func (r *Bridge) getRegex(regex string) (*regexp.Regexp, error) {
	if value, ok := r.regexMap.Load(regex); ok {
		if t, ok := value.(*regexp.Regexp); ok {
			return t, nil
		}
		return nil, fmt.Errorf("unexpected type in regexMap for key %s", regex)
	}
	compiled, err := regexp.Compile(regex)
	if err != nil {
		return nil, err
	}
	r.regexMap.Store(regex, compiled)
	return compiled, nil
}

func (r *Bridge) checkVersionTaskStatus(task *models.VersionDecompileTask, allowedStoppedStatus bool) bool {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	t := task.DecompileStatus == status.Running || task.MatchStatus == status.Running
	if allowedStoppedStatus {
		return !t
	}
	return !(t || task.MatchStatus == status.Stopped)
}

func (r *Bridge) GetAllMiniApp() ([]wechat.InfoToFront, error) {
	itemsToFront := make([]wechat.InfoToFront, 0)
	if r.app.Config.Wechat.Applet == "" {
		return itemsToFront, nil
	}
	miniPrograms, err := r.wechat.GetAllMiniApp()
	if err != nil {
		if os.IsNotExist(err) {
			return itemsToFront, nil
		}
		return nil, err
	}
	for _, miniProgram := range miniPrograms {
		versionsTask := r.createVersionTasks(miniProgram)
		versionStatuses, err := r.handleVersionTasks(miniProgram.AppID, versionsTask)
		if err != nil {
			r.app.Logger.Error(err)
			continue
		}
		info, err := r.findOrCreateInfo(miniProgram.AppID)
		if err != nil {
			r.app.Logger.Error(err)
			continue
		}
		itemToFront := wechat.InfoToFront{
			MiniAppBaseInfo: miniProgram.MiniAppBaseInfo,
			Status:          status.Waiting,
			Info:            info,
			Versions:        versionStatuses,
		}
		itemsToFront = append(itemsToFront, itemToFront)
	}
	return itemsToFront, nil
}

func (r *Bridge) GetInfo(appid string) error {
	// 从数据库中查找信息
	info, err := r.wxRepo.FindInfoByAppID(appid)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		r.app.Logger.Error(err)
		return err
	}

	// 查询最新的信息
	tmpInfo, e := r.wechat.QueryMimiAPPInfo(appid)
	if e != nil {
		r.app.Logger.Error(e)
		return e
	}

	// 如果数据库中未找到信息，则创建新信息
	if errors.Is(err, gorm.ErrRecordNotFound) {
		e = r.wxRepo.CreateInfo(&models.Info{Info: tmpInfo})
		if e != nil {
			r.app.Logger.Error(e)
			return e
		}
		return nil
	}

	// 如果数据库中已存在信息，则更新信息
	info.Info = tmpInfo
	e = r.wxRepo.UpdateInfo(info)
	if e != nil {
		r.app.Logger.Error(err)
		return e
	}

	return nil
}

func (r *Bridge) SetAppletPath(path string) error {
	r.app.Config.Wechat.Applet = path
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		r.app.Logger.Error(err)
		return err

	}
	r.wechat.SetApplet(path)
	return nil
}

func (r *Bridge) SaveWechatRules(rules []string) error {
	var t []string
	for _, rule := range rules {
		tt := fmt.Sprintf("\"%s\"", rule)
		ttt, err := strconv.Unquote(tt)
		if err != nil {
			return errors.New("语法错误：" + tt)
		}
		t = append(t, ttt)
	}
	r.app.Config.Wechat.Rules = t
	if err := r.app.WriteConfig(r.app.Config); err != nil {
		return err
	}
	r.wechat.SetRegex(t)
	return nil
}

func (r *Bridge) GetWechatRules() []string {
	var t []string
	for _, rule := range r.app.Config.Wechat.Rules {
		tt := strconv.Quote(rule)
		t = append(t, tt[1:len(tt)-1])
	}
	return t
}

func (r *Bridge) Decompile(item wechat.InfoToFront) {
	go func() {
		for _, versionTaskStatus := range item.Versions {
			go func(appid, version string) {
				task, err := r.wxRepo.FindVersionTaskByAppIDAndVersionNum(appid, version)
				if err != nil {
					r.app.Logger.Error(err)
					return
				}
				r.app.Logger.Debug(task)
				// 跳过正在反编译或者信息提取的任务
				passed := r.checkVersionTaskStatus(task, true)
				if !passed {
					return
				}

				files := r.decompile(task)
				r.extractInfo(task, files)
			}(item.MiniAppBaseInfo.AppID, versionTaskStatus.Number)
		}
	}()
}

func (r *Bridge) decompileBulk(items []wechat.InfoToFront) {
	go func() {
		for _, item := range items {
			for _, version := range item.Versions {
				task, err := r.wxRepo.FindVersionTaskByAppIDAndVersionNum(item.AppID, version.Number)
				if err != nil {
					r.app.Logger.Error(err)
					continue
				}

				r.decompileConcurrencyChan <- struct{}{}
				go func(task *models.VersionDecompileTask) {
					defer func() { <-r.decompileConcurrencyChan }()
					// 跳过正在反编译或者信息提取的任务
					passed := r.checkVersionTaskStatus(task, false)
					if !passed {
						return
					}

					files := r.decompile(task)
					r.extractConcurrencyChan <- struct{}{}
					go func() {
						defer func() { <-r.extractConcurrencyChan }()
						r.extractInfo(task, files)
					}()
				}(task)
			}
		}
	}()
}

func (r *Bridge) ClearApplet() error {
	err := os.RemoveAll(r.app.Config.Wechat.Applet)
	if err != nil {
		return err
	}
	return r.wxRepo.DeleteAllVersionDecompileTask()
}

func (r *Bridge) ClearDecompiled() error {
	if err := r.wxRepo.DeleteAllVersionDecompileTask(); err != nil {
		r.app.Logger.Error(err)
		return err
	}
	return os.RemoveAll(r.app.Config.WechatDataDir)
}

func (r *Bridge) GetMatchedString(appid, version string) []string {
	task, err := r.wxRepo.FindVersionTaskByAppIDAndVersionNum(appid, version)
	if err != nil {
		r.app.Logger.Error(err)
		return nil
	}
	return strings.Split(task.Matched, "\n")
}

func (r *Bridge) AutoDecompile(enable bool) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.autoDecompile = enable
}

type MiniAPPInfoCache struct {
	mu    sync.Mutex
	items []wechat.Info
}

func (r *MiniAPPInfoCache) TakeALl() []wechat.Info {
	r.mu.Lock()
	defer r.mu.Unlock()
	result := make([]wechat.Info, len(r.items))
	copy(result, r.items)
	r.items = r.items[:0]
	return result
}
func (r *MiniAPPInfoCache) Add(info wechat.Info) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.items = append(r.items, info)
}
