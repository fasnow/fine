package wechat

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"embed"
	"fine/backend/app"
	"fine/backend/config/v2"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/logger"
	"fine/backend/runtime"
	"fine/backend/service/model/wechat"
	"fine/backend/utils"
	"fmt"
	"golang.org/x/crypto/pbkdf2"
	"os"
	"os/exec"
	"path/filepath"
	runtime2 "runtime"
	"sort"
	"sync"
	"time"
)

func GetDecompileExe() (string, error) {
	filename := filepath.Join(config.GetBaseDir(), "bin", "decompile.exe")
	if runtime2.GOOS != "windows" {
		filename = filepath.Join(config.GetBaseDir(), "bin", "decompile")
	}
	if utils.FileExist(filename) {
		return filename, nil
	}
	data, err := decompile.ReadFile("decompile")
	if err != nil {
		logger.Info(err.Error())
		return "", err
	}
	err = utils.WriteFile(filename, data, 0755)
	if err != nil {
		logger.Info(err.Error())
		return "", err
	}
	return filename, nil
}

type Bridge struct {
	app       *app.App
	dbService *service.WechatDBService
}

func NewWechatBridge(app *app.App) *Bridge {
	c := &Bridge{
		app:       app,
		dbService: service.NewWechatDBService(),
	}
	return c
}

func (r *Bridge) GetAllMiniProgram() ([]wechat.MiniProgram, error) {
	appletPath := config.GetWechat().Applet
	items := make([]wechat.MiniProgram, 0)
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
				items = append(items, wechat.MiniProgram{
					AppID:      entry.Name(),
					UpdateDate: info.ModTime().Format("2006/01/02 15:04"),
					Versions:   versions,
				})
			}
		}
	}

	for i := 0; i < len(items); i++ {
		miniProgram := items[i]
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
					tt := &items[i].Versions[j].Unpacked
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
	return items, nil
}

func (r *Bridge) SetAppletPath(path string) error {
	t := config.GetWechat()
	t.Applet = path
	if err := config.GetSingleton().SaveWechat(t); err != nil {
		logger.Info(err.Error())
		return err

	}
	return nil
}

//go:embed decompile
var decompile embed.FS

var cache = utils.NewCache() //存储正在反编译的文件任务
var wg sync.WaitGroup
var semaphore = make(chan struct{}, 3) // 限制并发的通道

func (r *Bridge) Decompile(items []wechat.MiniProgram) error {
	exePath, err := GetDecompileExe()
	if err != nil {
		logger.Info(err.Error())
		return err
	}

	for _, item := range items {
		for _, versions := range item.Versions {
			semaphore <- struct{}{} // 往通道中放入信号量
			wg.Add(1)
			go func(appid, version string) {
				defer wg.Done()
				defer func() { <-semaphore }() // 任务完成后释放通道中的信号量

				//已在处理的不再处理，使用二次判断避免重复反编译 todo:此处性能待优化
				is := r.dbService.FindByAppId(appid)
				for _, v := range is.Versions {
					if v.Number == version && v.Unpacked {
						return
					}
				}
				if _, ok := cache.Get(appid + version); ok {
					return
				}

				cache.Set(appid+version, "", 999*time.Second)
				defer cache.Delete(appid + version)
				event.Emit(event.GetSingleton().DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 开始反编译\n", appid, version))

				//读取加密的wxapkg包并解密到指定文件
				dir := filepath.Join(config.GetWechat().Applet, appid, version)
				files, _ := os.ReadDir(dir)
				var outputDir = filepath.Join(config.GetWechatDataPath(), appid, version)
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
					bytes, err := os.ReadFile(filepath.Join(config.GetWechat().Applet, appid, version, sourceFileName))
					if err != nil {
						event.Emit(event.GetSingleton().DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 读取wxapkg文件时出错：%s\n", appid, version, err.Error()))
						return
					}
					t, err := Decrypt(bytes, appid, "saltiest", "the iv: 16 bytes")
					if err != nil {
						event.Emit(event.GetSingleton().DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 解密wxapkg文件时出错：%s\n", appid, version, err.Error()))
						return
					}
					var targetFile = filepath.Join(outputDir, sourceFileName)
					if err := utils.WriteFile(targetFile, t, 0666); err != nil {
						event.Emit(event.GetSingleton().DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 无法写入解密后的文件到指定位置：%s\n", appid, version, err.Error()))
						return
					}
					targetFiles = append(targetFiles, targetFile)
				}
				cmd := exec.Command(exePath, filepath.Join(outputDir, "__APP__.wxapkg"))
				runtime.HideCmdWindow(cmd)

				//反编译程序内部出错但是此时可能已经成功反编译,所以只能其他错误再返回
				if err := cmd.Run(); err != nil && cmd.ProcessState.ExitCode() != 1 {
					logger.Info(err.Error())
					event.Emit(event.GetSingleton().DecompileWxMiniProgramOutput, fmt.Sprintf("[%s  %s] 反编译时发生错误：%s\n", appid, version, err.Error()))
					return
				}

				miniProgram := r.dbService.FindByAppId(appid)
				if miniProgram.AppID != "" {
					if err := r.dbService.UpdateUnpackedStatus(appid, version, true); err != nil {
						logger.Info(err.Error())
					}
				}
				event.Emit(event.GetSingleton().DecompileWxMiniProgramDone, fmt.Sprintf("[%s  %s] 反编译完成\n", appid, version))
			}(item.AppID, versions.Number)
		}
	}
	go func() {
		wg.Wait()
	}()
	return nil
}

func (r *Bridge) ClearApplet() error {
	err := runtime.NewPath().RemoveAll(config.GetWechat().Applet, true)
	if err != nil {
		return err
	}
	return r.dbService.DeleteAll()
}

func (r *Bridge) ClearDecompiled() error {
	err := runtime.NewPath().RemoveAll(config.GetWechatDataPath(), true)
	if err != nil {
		return err
	}
	return r.dbService.DeleteAll()
}

func Decrypt(dataByte []byte, wxid, salt, iv string) ([]byte, error) {
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

func (r *Bridge) extract() {

}
