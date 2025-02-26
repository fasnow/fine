package wechat

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"embed"
	"fine/backend/application"
	"fine/backend/constant/event"
	"fine/backend/constant/status"
	"fine/backend/database"
	"fine/backend/database/models"
	"fine/backend/database/repository"
	"fine/backend/osoperation"
	"fine/backend/proxy/v2"
	"fine/backend/service/model/wechat"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/pbkdf2"
	"gorm.io/gorm"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	runtime2 "runtime"
	"sort"
	"strings"
	"sync"
	"time"
)

//go:embed decompile_darwin
var decompile embed.FS

var filteredFileExt = []string{".png", ".jpg", ".jpeg", ".wxapkg", ".br"}

type Bridge struct {
	app      *application.Application
	wxRepo   repository.WechatRepository
	http     *http.Client
	regexMap sync.Map
}

func (r *Bridge) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func NewWechatBridge(app *application.Application) *Bridge {
	c := &Bridge{
		app:    app,
		wxRepo: repository.NewWechatRepository(database.GetConnection()),
		http:   &http.Client{},
	}
	c.wxRepo.RestVersionStatus()
	c.UseProxyManager(app.ProxyManager)
	return c
}

func (r *Bridge) GetAllMiniProgram() ([]wechat.InfoToFront, error) {
	items := make([]wechat.InfoToFront, 0)
	if r.app.Config.Wechat.Applet == "" {
		return items, nil
	}

	// 获取所有的小程序，按修改时间排序
	entries, err := os.ReadDir(r.app.Config.Wechat.Applet)
	if err != nil {
		r.app.Logger.Error(err)
		return nil, err
	}
	sort.Sort(FileInfoSlice(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			appid := entry.Name()
			if strings.HasPrefix(appid, "wx") {
				continue
			}
			versionsPath := filepath.Join(r.app.Config.Wechat.Applet, appid)
			if isDir, err := utils.IsDir(versionsPath); err != nil {
				r.app.Logger.Error(err)
			} else if !isDir {
				continue
			}
			versionEntries, err2 := os.ReadDir(versionsPath)
			if err2 != nil {
				r.app.Logger.Error(err2)
				return nil, err2
			}
			// 按修改时间排序
			sort.Sort(FileInfoSlice(versionEntries))
			var versions []*models.VersionDecompileTask
			for _, versionEntry := range versionEntries {
				var file = filepath.Join(versionsPath, versionEntry.Name(), "__APP__.wxapkg")
				fileInfo, err3 := os.Stat(file)
				if err3 != nil {
					//不写入日志避免文件过大
					continue
				}
				versions = append(versions, &models.VersionDecompileTask{
					AppID:           appid,
					DecompileStatus: status.Waiting,
					MatchStatus:     status.Waiting,
					Version: &wechat.Version{
						Number:     versionEntry.Name(),
						UpdateDate: fileInfo.ModTime().Format("2006/01/02 15:04"),
					},
				})
			}

			if info, err3 := entry.Info(); err3 != nil {
				r.app.Logger.Error(err3)
			} else {
				miniProgram := &wechat.MiniProgram{
					AppID:      appid,
					UpdateDate: info.ModTime().Format("2006/01/02 15:04"),
				}
				task := &models.MiniProgramDecompileTask{
					Status:      status.Waiting,
					MiniProgram: miniProgram,
					Versions:    versions,
				}
				item := wechat.InfoToFront{
					MiniProgram: miniProgram,
					Info:        wechat.Info{AppID: appid},
				}
				if decompileTask, err4 := r.wxRepo.FindByAppId(appid); errors.Is(err4, gorm.ErrRecordNotFound) {
					//没有就插入新的
					if err5 := r.wxRepo.CreateTask(task); err5 != nil {
						r.app.Logger.Error(err5)
					}
					for _, version := range versions {
						item.Versions = append(item.Versions, &wechat.VersionStatus{
							Number:          version.Number,
							DecompileStatus: status.Waiting,
							MatchStatus:     status.Waiting,
						})
					}
				} else {
					//有则判断状态
					var newVersions []*models.VersionDecompileTask
					for j := 0; j < len(versions); j++ {
						if len(decompileTask.Versions) == 0 {
							//添加新的版本
							newVersions = append(newVersions, versions[j])
							item.Versions = append(item.Versions, &wechat.VersionStatus{
								Number:          versions[j].Number,
								DecompileStatus: status.Waiting,
								MatchStatus:     status.Waiting,
							})
							continue
						}
						for _, version := range decompileTask.Versions {
							if versions[j].Number == version.Number {
								item.Versions = append(item.Versions, &wechat.VersionStatus{
									Number:          version.Number,
									DecompileStatus: version.DecompileStatus,
									MatchStatus:     version.MatchStatus,
								})
								continue
							}
							//添加新的版本
							newVersions = append(newVersions, versions[j])
							item.Versions = append(item.Versions, &wechat.VersionStatus{
								Number:          version.Number,
								DecompileStatus: status.Waiting,
								MatchStatus:     status.Waiting,
							})
						}
					}
					if len(newVersions) > 0 {
						if err5 := r.wxRepo.AppendVersionByAppID(appid, newVersions); err5 != nil {
							r.app.Logger.Error(err5)
						}
					}
				}

				if appInfo, err4 := r.wxRepo.FindInfoByAppID(appid); err4 != nil {
					tmpInfo, e := r.queryAppID(appid)
					if e != nil {
						r.app.Logger.Error(e)
					} else {
						if err5 := r.wxRepo.CreateInfo(&models.Info{
							Info: tmpInfo,
						}); err5 != nil {
							r.app.Logger.Error(e)
						}
						item.Info.Nickname = tmpInfo.Nickname
						item.Info.Username = tmpInfo.Username
						item.Info.Description = tmpInfo.Description
						item.Info.Avatar = tmpInfo.Avatar
						item.Info.UsesCount = tmpInfo.UsesCount
						item.Info.PrincipalName = tmpInfo.PrincipalName
					}
				} else {
					item.Info.Nickname = appInfo.Nickname
					item.Info.Username = appInfo.Username
					item.Info.Description = appInfo.Description
					item.Info.Avatar = appInfo.Avatar
					item.Info.UsesCount = appInfo.UsesCount
					item.Info.PrincipalName = appInfo.PrincipalName
				}
				items = append(items, item)
			}
		}
	}
	return items, nil
}

func (r *Bridge) GetInfo(appid string) error {
	info, err := r.wxRepo.FindInfoByAppID(appid)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		r.app.Logger.Error(err)
		return err
	}
	tmpInfo, e := r.queryAppID(appid)
	if e != nil {
		r.app.Logger.Error(e)
		return e
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		if e = r.wxRepo.CreateInfo(&models.Info{Info: tmpInfo}); e != nil {
			r.app.Logger.Error(err)
			return e
		}
		return nil
	}
	info.Info = tmpInfo
	if e = r.wxRepo.UpdateInfo(info); e != nil {
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
	return nil
}

var decompileSemaphore = make(chan struct{}, 10)
var extractInfoSemaphore = make(chan struct{}, 200)
var mutex = sync.Mutex{}

func (r *Bridge) DecompileBulk(items []wechat.InfoToFront) error {
	exePath, err := generateDecompileExe()
	if err != nil {
		r.app.Logger.Error(err)
		return err
	}
	go func() {
		for _, item := range items {
			for _, versions := range item.Versions {
				decompileSemaphore <- struct{}{}
				go func(appid, version string) {
					defer func() {
						<-decompileSemaphore
					}()
					var data = map[string]string{
						"appID":   appid,
						"version": version,
					}
					mutex.Lock()
					task, err := r.wxRepo.FindVersionByAppIDAndVersionNum(appid, version)
					if err != nil {
						r.app.Logger.Error(err)
						return
					}
					if task.DecompileStatus == status.Running || task.DecompileStatus == status.Stopped {
						return
					}
					task.DecompileStatus = status.Running
					if err := r.wxRepo.UpdateVersion(task); err != nil {
						r.app.Logger.Error(err)
					}
					mutex.Unlock()
					event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
						Status:  status.Running,
						Message: fmt.Sprintf("[%s  %s] 开始反编译\n", appid, version),
						Data:    data,
					})

					//读取加密的wxapkg包并解密到指定文件
					files, _ := os.ReadDir(filepath.Join(r.app.Config.Wechat.Applet, appid, version))
					var outputDir = filepath.Join(r.app.Config.WechatDataDir, appid, version)
					var sourceFilesName []string
					var targetFiles = make([]string, 0)
					defer func(targetFiles *[]string) {
						//反编译完成后删除解密的wxapkg文件
						for _, file := range *targetFiles {
							os.Remove(file)
						}
					}(&targetFiles)
					for _, file := range files {
						if !file.IsDir() && filepath.Ext(file.Name()) == ".wxapkg" {
							sourceFilesName = append(sourceFilesName, file.Name())
						}
					}

					for _, sourceFileName := range sourceFilesName {
						bytes, err := os.ReadFile(filepath.Join(r.app.Config.Wechat.Applet, appid, version, sourceFileName))
						if err != nil {
							event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
								Status: status.Error,
								Error:  fmt.Sprintf("[%s  %s] 读取wxapkg文件时出错：%s\n", appid, version, err.Error()),
								Data:   data,
							})
							continue
						}

						// windows下需要先解密
						if runtime2.GOOS == "windows" {
							bytes, err = decrypt(bytes, appid, "saltiest", "the iv: 16 bytes")
							if err != nil {
								event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
									Status: status.Error,
									Error:  fmt.Sprintf("[%s  %s] 解密wxapkg文件时出错：%s\n", appid, version, err.Error()),
									Data:   data,
								})
								continue
							}
						}

						var targetFile = filepath.Join(outputDir, sourceFileName)
						if err := utils.WriteFile(targetFile, bytes, 0766); err != nil {
							event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
								Status: status.Error,
								Error:  fmt.Sprintf("[%s  %s] 无法写入解密后的文件到指定位置：%s\n", appid, version, err.Error()),
								Data:   data})
							continue
						}
						targetFiles = append(targetFiles, targetFile)
					}
					r.app.Logger.Info(targetFiles)
					cmd := exec.Command(exePath, "-t", outputDir, "-o", outputDir)
					r.app.Logger.Info(cmd)
					osoperation.HideCmdWindow(cmd)

					//反编译程序内部出错但是此时可能已经成功反编译,所以只能其他错误再返回
					if err := cmd.Run(); err != nil && cmd.ProcessState.ExitCode() != 1 {
						r.app.Logger.Error(err)
						mutex.Lock()
						task.DecompileStatus = status.Error
						if err := r.wxRepo.UpdateVersion(task); err != nil {
							r.app.Logger.Error(err)
						}
						mutex.Unlock()
						event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
							Status: status.Error,
							Error:  fmt.Sprintf("[%s  %s] 反编译时发生错误：%s\n", appid, version, err.Error()),
							Data:   data})
						return
					}
					mutex.Lock()
					task.DecompileStatus = status.Stopped
					task.MatchStatus = status.Running
					if err := r.wxRepo.UpdateVersion(task); err != nil {
						r.app.Logger.Error(err)
					}
					mutex.Unlock()
					event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
						Status:  status.Stopped,
						Message: fmt.Sprintf("[%s  %s] 反编译完成,信息提取开始\n", appid, version),
						Data:    data,
					})
					r.extractInfo(appid, version)
					mutex.Lock()
					task.MatchStatus = status.Stopped
					if err := r.wxRepo.UpdateVersion(task); err != nil {
						r.app.Logger.Error(err)
					}
					mutex.Unlock()
					event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
						Status:  status.Stopped,
						Message: fmt.Sprintf("[%s  %s] 信息提取完成\n", appid, version),
						Data:    data,
					})
				}(item.MiniProgram.AppID, versions.Number)
			}
		}
	}()
	return nil
}

func (r *Bridge) Decompile(item wechat.InfoToFront) error {
	exePath, err := generateDecompileExe()
	if err != nil {
		r.app.Logger.Error(err)
		return err
	}
	r.app.Logger.Debug(item)
	go func() {
		for _, versions := range item.Versions {
			go func(appid, version string) {
				var data = map[string]string{
					"appID":   appid,
					"version": version,
				}
				mutex.Lock()
				task, err := r.wxRepo.FindVersionByAppIDAndVersionNum(appid, version)
				if err != nil {
					r.app.Logger.Error(err)
					return
				}
				r.app.Logger.Debug(task)
				if task.DecompileStatus == status.Running || task.MatchStatus == status.Running {
					return
				}
				task.DecompileStatus = status.Running
				if err := r.wxRepo.UpdateVersion(task); err != nil {
					r.app.Logger.Error(err)
				}
				mutex.Unlock()
				event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
					Status:  status.Running,
					Message: fmt.Sprintf("[%s  %s] 开始反编译\n", appid, version),
					Data:    data,
				})

				//读取加密的wxapkg包并解密到指定文件
				files, _ := os.ReadDir(filepath.Join(r.app.Config.Wechat.Applet, appid, version))
				var outputDir = filepath.Join(r.app.Config.WechatDataDir, appid, version)
				var sourceFilesName []string
				var targetFiles = make([]string, 0)
				defer func(targetFiles *[]string) {
					//反编译完成后删除解密的wxapkg文件
					for _, file := range *targetFiles {
						os.Remove(file)
					}
				}(&targetFiles)
				for _, file := range files {
					if !file.IsDir() && filepath.Ext(file.Name()) == ".wxapkg" {
						sourceFilesName = append(sourceFilesName, file.Name())
					}
				}

				for _, sourceFileName := range sourceFilesName {
					bytes, err := os.ReadFile(filepath.Join(r.app.Config.Wechat.Applet, appid, version, sourceFileName))
					if err != nil {
						event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
							Status: status.Error,
							Error:  fmt.Sprintf("[%s  %s] 读取wxapkg文件时出错：%s\n", appid, version, err.Error()),
							Data:   data,
						})
						continue
					}

					// windows下需要先解密
					if runtime2.GOOS == "windows" {
						bytes, err = decrypt(bytes, appid, "saltiest", "the iv: 16 bytes")
						if err != nil {
							event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
								Status: status.Error,
								Error:  fmt.Sprintf("[%s  %s] 解密wxapkg文件时出错：%s\n", appid, version, err.Error()),
								Data:   data,
							})
							continue
						}
					}

					var targetFile = filepath.Join(outputDir, sourceFileName)
					if err := utils.WriteFile(targetFile, bytes, 0766); err != nil {
						event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
							Status: status.Error,
							Error:  fmt.Sprintf("[%s  %s] 无法写入解密后的文件到指定位置：%s\n", appid, version, err.Error()),
							Data:   data})
						continue
					}
					targetFiles = append(targetFiles, targetFile)
				}
				r.app.Logger.Info(targetFiles)
				cmd := exec.Command(exePath, "-t", outputDir, "-o", outputDir)
				r.app.Logger.Info(cmd)
				osoperation.HideCmdWindow(cmd)

				//反编译程序内部出错但是此时可能已经成功反编译,所以只能其他错误再返回
				if err := cmd.Run(); err != nil && cmd.ProcessState.ExitCode() != 1 {
					r.app.Logger.Error(err)
					task.DecompileStatus = status.Error
					if err := r.wxRepo.UpdateVersion(task); err != nil {
						r.app.Logger.Error(err)
					}
					event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
						Status: status.Error,
						Error:  fmt.Sprintf("[%s  %s] 反编译时发生错误：%s\n", appid, version, err.Error()),
						Data:   data})
					return
				}
				mutex.Lock()
				task.DecompileStatus = status.Stopped
				task.MatchStatus = status.Running
				if err := r.wxRepo.UpdateVersion(task); err != nil {
					r.app.Logger.Error(err)
				}
				mutex.Unlock()
				event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
					Status:  status.Stopped,
					Message: fmt.Sprintf("[%s  %s] 反编译完成,信息提取开始\n", appid, version),
					Data:    data,
				})
				r.extractInfo(appid, version)
				mutex.Lock()
				task.MatchStatus = status.Stopped
				if err := r.wxRepo.UpdateVersion(task); err != nil {
					r.app.Logger.Error(err)
				}
				mutex.Unlock()
				event.EmitV2(event.DecompileWxMiniProgram, event.EventDetail{
					Status:  status.Stopped,
					Message: fmt.Sprintf("[%s  %s] 信息提取完成\n", appid, version),
					Data:    data,
				})
			}(item.MiniProgram.AppID, versions.Number)
		}
	}()
	return nil
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

func decrypt(dataByte []byte, wxid, salt, iv string) ([]byte, error) {
	dk := pbkdf2.Key([]byte(wxid), []byte(salt), 1000, 32, sha1.New)
	block, _ := aes.NewCipher(dk)
	blockMode := cipher.NewCBCDecrypter(block, []byte(iv))
	originData := make([]byte, 1024)
	blockMode.CryptBlocks(originData, dataByte[6:1024+6])
	afData := make([]byte, len(dataByte)-1024-6)
	var xorKey = byte(0x66)
	if len(wxid) >= 2 {
		xorKey = wxid[len(wxid)-2]
	}
	for i, b := range dataByte[1024+6:] {
		afData[i] = b ^ xorKey
	}
	return append(originData[:1023], afData...), nil
}

// WxapkgInfo 表示包含 _APP_.wxapkg 的目录信息
type WxapkgInfo struct {
	Path       string       `json:"path"` // 目录路径
	UpdateDate string       `json:"updateDate"`
	SubDirs    []WxapkgInfo `json:"subDirs"` // 子目录信息
	Unpacked   bool         `json:"unpacked"`
}

type FileInfoSlice []os.DirEntry

func (f FileInfoSlice) Len() int {
	return len(f)
}

func (f FileInfoSlice) Less(i, j int) bool {
	info1, err := f[i].Info()
	if err != nil {
		return false
	}
	info2, err := f[j].Info()
	if err != nil {
		return false
	}
	return info1.ModTime().After(info2.ModTime())
}

func (f FileInfoSlice) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}

func (r *Bridge) extractInfo(appid, version string) {
	targetDir := filepath.Join(r.app.Config.WechatDataDir, appid, version)
	task, err := r.wxRepo.FindVersionByAppIDAndVersionNum(appid, version)
	if err != nil {
		r.app.Logger.Error(err)
	}
	var matchedStrings []string
	var extractInfoWg sync.WaitGroup
	var matchResults sync.Map
	err = filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			r.app.Logger.Error(err)
			return nil
		}
		if !info.IsDir() {
			// 跳过非文本文件
			if utils.StringsContain(filteredFileExt, filepath.Ext(path)) {
				return nil
			}
			// 读取文件内容
			content, err2 := os.ReadFile(path)
			if err2 != nil {
				r.app.Logger.Info(err2)
				return nil
			}

			for _, regex := range r.app.Config.Wechat.Rules {
				re, err := r.getRegex(regex)
				if err != nil {
					r.app.Logger.Error(err)
					continue
				}
				extractInfoWg.Add(1)
				extractInfoSemaphore <- struct{}{}
				go func(re *regexp.Regexp) {
					defer func() {
						extractInfoWg.Done()
						<-extractInfoSemaphore
					}()
					r.app.Logger.Debug(path, re.String())
					matches := re.FindAllStringSubmatch(string(content), -1)
					var localMatches []string
					for _, match := range matches {
						localMatches = append(localMatches, match[0])
					}
					if len(localMatches) > 0 {
						matchResults.Store(path+re.String(), localMatches)
					}
				}(re)
			}
		}
		return nil
	})
	extractInfoWg.Wait()
	if err != nil {
		r.app.Logger.Error(err)
	}
	matchResults.Range(func(key, value interface{}) bool {
		matches := value.([]string)
		matchedStrings = append(matchedStrings, matches...)
		return true
	})
	matchedStrings = utils.RemoveEmptyAndDuplicateString(matchedStrings)
	task.Matched = strings.Join(matchedStrings, "\n")
	if err := r.wxRepo.UpdateVersion(task); err != nil {
		r.app.Logger.Error(err)
		return
	}
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

func (r *Bridge) GetMatchedString(appid, version string) []string {
	task, err := r.wxRepo.FindVersionByAppIDAndVersionNum(appid, version)
	if err != nil {
		r.app.Logger.Error(err)
		return nil
	}
	return strings.Split(task.Matched, "\n")
}

func (r *Bridge) queryAppID(appid string) (*wechat.Info, error) {
	var request, _ = http.NewRequest("POST", "https://kainy.cn/api/weapp/info/", strings.NewReader("appid="+appid))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	response, err := r.http.Do(request)
	if err != nil {
		return nil, err
	}
	bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	code := gjson.Get(string(bytes), "code").Int()
	msg := gjson.Get(string(bytes), "error").String()
	if code != 0 && code != 2 { //code = 2表示未收录
		return nil, errors.New(msg)
	}
	result := &wechat.Info{
		AppID: appid,
	}
	result.Nickname = gjson.Get(string(bytes), "data.nickname").String()
	result.Username = gjson.Get(string(bytes), "data.username").String()
	result.Description = gjson.Get(string(bytes), "data.description").String()
	result.Avatar = gjson.Get(string(bytes), "data.avatar").String()
	result.UsesCount = gjson.Get(string(bytes), "data.uses_count").String()
	result.PrincipalName = gjson.Get(string(bytes), "data.principal_name").String()
	return result, nil
}

func generateDecompileExe() (string, error) {
	filename := filepath.Join(application.DefaultApp.AppDir, "bin", "decompile.exe")
	if runtime2.GOOS != "windows" {
		filename = filepath.Join(application.DefaultApp.AppDir, "bin", "decompile")
	}
	if utils.FileExist(filename) {
		currentDate := time.Now()

		//2024/11/25
		comparisonDate := time.Date(2024, 11, 25, 0, 0, 0, 0, time.Local)
		if currentDate.After(comparisonDate) {
			return filename, nil
		}
	}
	data, err := decompile.ReadFile("decompile")
	if err != nil {
		return "", err
	}
	err = utils.WriteFile(filename, data, 0766)
	if err != nil {
		return "", err
	}
	return filename, nil
}
