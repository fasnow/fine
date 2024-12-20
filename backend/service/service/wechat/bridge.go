package wechat

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"embed"
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/models"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/proxy/v2"
	"fine/backend/runtime"
	"fine/backend/service/model/wechat"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/pbkdf2"
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

//go:embed decompile
var decompile embed.FS

type Bridge struct {
	app       *app.App
	dbService *service.WechatDBService
	http      *http.Client
}

func (r *Bridge) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func NewWechatBridge(app *app.App) *Bridge {
	c := &Bridge{
		app:       app,
		dbService: service.NewWechatDBService(),
		http:      &http.Client{},
	}
	c.UseProxyManager(config.ProxyManager)
	return c
}

func (r *Bridge) GetAllMiniProgram() ([]wechat.InfoToFront, error) {
	appletPath := config.GlobalConfig.Wechat.Applet
	miniPrograms := make([]wechat.MiniProgram, 0)
	items := make([]wechat.InfoToFront, 0)
	entries, err := os.ReadDir(appletPath)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	// 按修改时间排序
	sort.Sort(FileInfoSlice(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			versionsPath := filepath.Join(appletPath, entry.Name())
			versionEntries, err := os.ReadDir(versionsPath)
			if err != nil {
				logger.Info(err.Error())
				return nil, err
			}
			// 按修改时间排序
			sort.Sort(FileInfoSlice(versionEntries))
			var versions []wechat.Version
			for _, versionEntry := range versionEntries {
				var file = filepath.Join(versionsPath, versionEntry.Name(), "__APP__.wxapkg")
				fileInfo, err := os.Stat(file)
				if err != nil {
					//logger.Info(err.Error()) //不写入日志避免文件过大
					continue
				}
				versions = append(versions, wechat.Version{
					Number:     versionEntry.Name(),
					UpdateDate: fileInfo.ModTime().Format("2006/01/02 15:04"),
				})
			}
			if len(versions) > 0 {
				info, _ := entry.Info()
				miniPrograms = append(miniPrograms, wechat.MiniProgram{
					AppID:      entry.Name(),
					UpdateDate: info.ModTime().Format("2006/01/02 15:04"),
					Versions:   versions,
				})
			}
		}
	}

	for i := 0; i < len(miniPrograms); i++ {
		miniProgram := miniPrograms[i]
		item := r.dbService.FindByAppId(miniProgram.AppID)

		//没有就插入新的
		if item.AppID == "" {
			r.dbService.Insert(miniProgram)
			continue
		}

		//有则判断状态
		var newVersions []wechat.Version
		for j := 0; j < len(miniProgram.Versions); j++ {
			for _, version := range item.Versions {
				t := version
				if miniProgram.Versions[j].Number == t.Number {
					tt := &miniPrograms[i].Versions[j].Unpacked
					*tt = t.Unpacked
					continue
				}
				//新的版本
				if j == len(item.Versions)-1 {
					newVersions = append(newVersions, miniProgram.Versions[j])
				}
			}
		}
		if len(newVersions) > 0 {
			r.dbService.AppendVersionByAppID(miniProgram.AppID, newVersions...)
		}
	}
	for i := 0; i < len(miniPrograms); i++ {
		item := miniPrograms[i]
		info, err := r.dbService.FindInfoByAppID(item.AppID)
		if err != nil {
			items = append(items, wechat.InfoToFront{
				MiniProgram: item,
			})
			logger.Info(err)
			continue
		}
		if info.ID == 0 || info.Nickname == "" {
			items = append(items, wechat.InfoToFront{
				MiniProgram: item,
			})
			continue
		}
		items = append(items, wechat.InfoToFront{
			MiniProgram:   item,
			Nickname:      info.Nickname,
			Username:      info.Username,
			Description:   info.Description,
			Avatar:        info.Avatar,
			UsesCount:     info.UsesCount,
			PrincipalName: info.PrincipalName,
		})
	}
	return items, nil
}

func (r *Bridge) SetAppletPath(path string) error {
	config.GlobalConfig.Wechat.Applet = path
	if err := config.Save(); err != nil {
		logger.Info(err.Error())
		return err

	}
	return nil
}

var cache = utils.NewCache() //存储正在反编译的文件任务
var wg sync.WaitGroup
var semaphore = make(chan struct{}, 3)
var cache3 = utils.NewCache() //存储正在查询信息任务
var wg3 sync.WaitGroup
var semaphore3 = make(chan struct{}, 1)

func (r *Bridge) Decompile(items []wechat.MiniProgram, reDecompile bool) error {
	exePath, err := generateDecompileExe()
	if err != nil {
		logger.Info(err.Error())
		return err
	}
	go func() {
		for _, item := range items {
			semaphore3 <- struct{}{}
			wg3.Add(1)
			go func(appid string) {
				defer func() {
					time.Sleep(5 * time.Second)
					wg3.Done()
					<-semaphore3
				}()

				//自动反编译时需要两次判断,顺序不能换
				if _, ok := cache3.Get(appid); ok {
					return
				}
				cache3.Set(appid, "", 999*time.Second)
				defer cache3.Delete(appid)
				if !reDecompile {
					info, _ := r.dbService.FindInfoByAppID(appid)
					if info.ID != 0 {
						return
					}
				}

				event.Emit(event.Events.ExtractWxMiniProgramInfoOutput, fmt.Sprintf("[%s] 正在查询小程序信息\n", appid))
				e, tmpInfo := r.QueryAppID(appid)
				if e != nil {
					logger.Info(e)
					event.Emit(event.Events.ExtractWxMiniProgramInfoOutput, fmt.Sprintf("[%s] 查询小程序信息出错: %s\n", appid, e))
					return
				}
				e = r.dbService.InsertInfo(models.Info{Info: tmpInfo})
				if e != nil {
					logger.Info(err)
				}
			}(item.AppID)
		}
	}()

	go func() {
		for _, item := range items {
			for _, versions := range item.Versions {
				semaphore <- struct{}{}
				wg.Add(1)
				go func(appid, version string) {
					defer func() {
						wg.Done()
						<-semaphore
					}()

					//已在处理的不再处理，使用二次判断避免重复反编译 todo:此处性能待优化
					is := r.dbService.FindByAppId(appid)
					for _, v := range is.Versions {
						if v.Number == version && v.Unpacked && !reDecompile {
							return
						}
					}
					if _, ok := cache.Get(appid + version); ok {
						return
					}
					cache.Set(appid+version, "", 999*time.Second)
					defer cache.Delete(appid + version)

					event.Emit(event.Events.DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 开始反编译\n", appid, version))

					//读取加密的wxapkg包并解密到指定文件
					files, _ := os.ReadDir(filepath.Join(config.GlobalConfig.Wechat.Applet, appid, version))
					var outputDir = filepath.Join(config.GlobalConfig.WechatDataPath, appid, version)
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
						bytes, err := os.ReadFile(filepath.Join(config.GlobalConfig.Wechat.Applet, appid, version, sourceFileName))
						if err != nil {
							event.Emit(event.Events.DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 读取wxapkg文件时出错：%s\n", appid, version, err.Error()))
							continue
						}

						// windows下需要先解密
						if runtime2.GOOS == "windows" {
							bytes, err = decrypt(bytes, appid, "saltiest", "the iv: 16 bytes")
							if err != nil {
								event.Emit(event.Events.DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 解密wxapkg文件时出错：%s\n", appid, version, err.Error()))
								continue
							}
						}

						var targetFile = filepath.Join(outputDir, sourceFileName)
						if err := utils.WriteFile(targetFile, bytes, 0766); err != nil {
							event.Emit(event.Events.DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 无法写入解密后的文件到指定位置：%s\n", appid, version, err.Error()))
							continue
						}
						targetFiles = append(targetFiles, targetFile)
					}
					logger.Info(targetFiles)
					cmd := exec.Command(exePath, "-t", outputDir, "-o", outputDir)
					logger.Info(cmd)
					runtime.HideCmdWindow(cmd)

					//反编译程序内部出错但是此时可能已经成功反编译,所以只能其他错误再返回
					if err := cmd.Run(); err != nil && cmd.ProcessState.ExitCode() != 1 {
						logger.Info(err.Error())
						event.Emit(event.Events.DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 反编译时发生错误：%s\n", appid, version, err.Error()))
						return
					}

					miniProgram := r.dbService.FindByAppId(appid)
					if miniProgram.AppID != "" {
						if err := r.dbService.UpdateUnpackedStatus(appid, version, true); err != nil {
							logger.Info(err.Error())
						}
					}
					event.Emit(event.Events.DecompileWxMiniProgramDone, fmt.Sprintf("[%s  %s] 反编译完成\n", appid, version))
					event.Emit(event.Events.ExtractWxMiniProgramInfoOutput, fmt.Sprintf("[%s  %s] 信息提取开始\n", appid, version))
					r.extractInfo(appid, version)
					event.Emit(event.Events.ExtractWxMiniProgramInfoDone, map[string]any{
						"appid":   appid,
						"version": version,
					})
				}(item.AppID, versions.Number)
			}
		}
	}()
	return nil
}

func (r *Bridge) ClearApplet() error {
	err := runtime.NewPath().RemoveAll(config.GlobalConfig.Wechat.Applet, true)
	if err != nil {
		return err
	}
	return r.dbService.DeleteAll()
}

func (r *Bridge) ClearDecompiled() error {
	err := runtime.NewPath().RemoveAll(config.GlobalConfig.WechatDataPath, true)
	if err != nil {
		return err
	}
	r.dbService.DeleteAllInfo()
	return r.dbService.DeleteAll()
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
		logger.Info(err.Error())
		return false
	}
	info2, err := f[j].Info()
	if err != nil {
		logger.Info(err.Error())
		return false
	}
	return info1.ModTime().After(info2.ModTime())
}

func (f FileInfoSlice) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}

func (r *Bridge) extractInfo(appid, version string) {
	targetDir := filepath.Join(config.GlobalConfig.WechatDataPath, appid, version)
	rules := config.GlobalConfig.Wechat.Rules
	item := models.MatchedString{
		AppID:   appid,
		Version: version,
	}
	id, err := r.dbService.InsertMatchStringTask(item)
	if err != nil {
		logger.Info(err)
		return
	}
	item.ID = id
	var matchedStrings []string
	for _, rule := range rules {
		regexPattern := rule
		regex, err := regexp.Compile(regexPattern)
		if err != nil {
			logger.Info(err)
			logger.Info(regexPattern)
			continue
		}
		err = filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				logger.Info(err)
				return nil
			}
			if !info.IsDir() {
				// 读取文件内容
				content, err := os.ReadFile(path)
				if err != nil {
					logger.Info(err)
					return nil
				}
				matches := regex.FindAllStringSubmatch(string(content), -1)
				for _, match := range matches {
					matchedStrings = append(matchedStrings, match[0])
				}
			}
			return nil
		})
		if err != nil {
			logger.Info(err)
		}
	}
	r.dbService.UpdateMatchStringTask(id, true, matchedStrings)
}

func (r *Bridge) GetMatchedString(appid, version string) models.MatchedString {
	return r.dbService.FindMatchedString(appid, version)
}

func (r *Bridge) QueryAppID(appid string) (error, wechat.Info) {
	var re wechat.Info
	var request, _ = http.NewRequest("POST", "https://kainy.cn/api/weapp/info/", strings.NewReader("appid="+appid))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	response, err := r.http.Do(request)
	if err != nil {
		return err, re
	}
	bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return err, re
	}
	code := gjson.Get(string(bytes), "code").Int()
	msg := gjson.Get(string(bytes), "error").String()
	if code != 0 && code != 2 { //code = 2表示未收录
		return errors.New(msg), re
	}
	result := wechat.Info{
		AppID: appid,
	}
	result.Nickname = gjson.Get(string(bytes), "data.nickname").String()
	result.Username = gjson.Get(string(bytes), "data.username").String()
	result.Description = gjson.Get(string(bytes), "data.description").String()
	result.Avatar = gjson.Get(string(bytes), "data.avatar").String()
	result.UsesCount = gjson.Get(string(bytes), "data.uses_count").String()
	result.PrincipalName = gjson.Get(string(bytes), "data.principal_name").String()
	return nil, result
}

func generateDecompileExe() (string, error) {
	filename := filepath.Join(config.GlobalConfig.BaseDir, "bin", "decompile.exe")
	if runtime2.GOOS != "windows" {
		filename = filepath.Join(config.GlobalConfig.BaseDir, "bin", "decompile")
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
