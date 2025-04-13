package wechat

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"errors"
	"fine/backend/beauty"
	"fine/backend/matcher"
	"fine/backend/service/model/wechat"
	"fine/backend/service/service"
	"fine/backend/utils"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"runtime/debug"
	"sort"
	"strings"
	"sync"

	"github.com/fasnow/goproxy"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/pbkdf2"
)

const (
	DefaultSalt = "saltiest"
	DefaultIV   = "the iv: 16 bytes"
)

type WxapkgFile struct {
	NameLen uint32
	Name    string
	Offset  uint32
	Size    uint32
}

type WeChat struct {
	http           *http.Client
	Applet         string
	mutex          sync.Mutex
	jsBeautifier   *beauty.JSBeautifier
	htmlBeautifier *beauty.HTMLBeautifier
	jsonBeautifier *beauty.JSONBeautifier
	matcher        *matcher.Matcher
	beauty         bool
}

func New(applet string) *WeChat {
	return &WeChat{
		http: &http.Client{
			Timeout: goproxy.DefaultTimeout,
		},
		Applet:         applet,
		jsBeautifier:   beauty.NewJSBeautifier(),
		htmlBeautifier: beauty.NewHTMLBeautifier(),
		jsonBeautifier: beauty.NewJSONBeautifier(),
		matcher:        matcher.New(nil),
		beauty:         false,
	}
}

func (r *WeChat) UseProxyManager(manager *goproxy.GoProxy) {
	r.http = manager.GetClient()
}

func (r *WeChat) SetRules(rules []*matcher.Rule) {
	r.matcher.SetRules(rules)
}

func (r *WeChat) SetApplet(applet string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.Applet = applet
}

func (r *WeChat) QueryAppID(appid string) (*wechat.Info, error) {
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

func (r *WeChat) UnpackWxapkg(data []byte, outputDir string, eventFunc func(err error)) ([]string, error) {
	filesInfo, err := r.getFilesInfo(data)
	if err != nil {
		return nil, err
	}
	filesName := r.unpackFile(data, filesInfo, outputDir, eventFunc)
	return filesName, nil
}

func (r *WeChat) DecryptWxapkg(bytes []byte, wxID, salt, iv string) ([]byte, error) {
	dk := pbkdf2.Key([]byte(wxID), []byte(salt), 1000, 32, sha1.New)
	block, _ := aes.NewCipher(dk)
	blockMode := cipher.NewCBCDecrypter(block, []byte(iv))
	originData := make([]byte, 1024)
	blockMode.CryptBlocks(originData, bytes[6:1024+6])
	afData := make([]byte, len(bytes)-1024-6)
	var xorKey = byte(0x66)
	if len(wxID) >= 2 {
		xorKey = wxID[len(wxID)-2]
	}
	for i, b := range bytes[1024+6:] {
		afData[i] = b ^ xorKey
	}
	return append(originData[:1023], afData...), nil
}

func (r *WeChat) GetAllMiniApp() ([]*wechat.MiniProgram, error) {
	applet, err := filepath.Abs(r.Applet)
	if err != nil {
		return nil, err
	}
	items := make([]*wechat.MiniProgram, 0)

	// 获取所有的小程序，按修改时间排序
	entries, err := os.ReadDir(applet)
	if err != nil {
		return nil, err
	}
	sort.Sort(utils.FileInfoSlice(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		appid := entry.Name()
		if !strings.HasPrefix(appid, "wx") {
			continue
		}
		versionsDir := filepath.Join(applet, appid)
		if isDir, err := utils.IsDir(versionsDir); err != nil {
			return nil, err
		} else if !isDir {
			continue
		}
		versionEntries, err := os.ReadDir(versionsDir)
		if err != nil {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		miniProgramInfo := wechat.MiniAppBaseInfo{
			AppID:      appid,
			UpdateDate: info.ModTime().Format("2006/01/02 15:04"),
		}
		// 按修改时间排序
		sort.Sort(utils.FileInfoSlice(versionEntries))
		var versions []*wechat.Version
		for _, versionEntry := range versionEntries {
			var file = filepath.Join(versionsDir, versionEntry.Name(), "__APP__.wxapkg")
			if utils.FileExist(file) {
				info, err := versionEntry.Info()
				if err != nil {
					continue
				}
				versions = append(versions, &wechat.Version{
					Number:     info.Name(),
					UpdateDate: info.ModTime().Format("2006/01/02 15:04"),
				})
			}

		}
		items = append(items, &wechat.MiniProgram{
			MiniAppBaseInfo: &miniProgramInfo,
			Versions:        versions,
		})
	}
	return items, nil
}

func (r *WeChat) GetMiniAppWxapkgs(appid, version string) ([]string, error) {
	dir := filepath.Join(r.Applet, appid, version)
	var files []string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".wxapkg") {
			files = append(files, path)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func (r *WeChat) GetAllMiniAppWxapkgs() ([][]string, error) {
	miniApps, err := r.GetAllMiniApp()
	if err != nil {
		return nil, err
	}
	var allWxapkgs [][]string
	for _, miniApp := range miniApps {
		for _, version := range miniApp.Versions {
			wxapkgs, err := r.GetMiniAppWxapkgs(miniApp.AppID, version.Number)
			if err != nil {
				continue
			}
			if len(wxapkgs) > 0 {
				allWxapkgs = append(allWxapkgs, wxapkgs)
			}
		}
	}
	return allWxapkgs, nil
}

func (r *WeChat) ExtractInfo(content string) []matcher.MatchResult {
	return r.matcher.FindAllOptimized(content)
}

func (r *WeChat) unpackFile(data []byte, filesInfo []*WxapkgFile, outputDir string, eventFunc func(err error)) []string {
	var filesName []string
	var wg sync.WaitGroup
	fileChan := make(chan string, len(filesInfo))
	errChan := make(chan error, len(filesInfo))

	maxWorkers := runtime.NumCPU() * 2
	if maxWorkers < 1 {
		maxWorkers = 1
	}
	workerPool := make(chan struct{}, maxWorkers)

	// 启动错误处理goroutine
	go func() {
		for err := range errChan {
			if eventFunc != nil {
				eventFunc(err)
			}
		}
	}()

	// 启动文件处理goroutine
	for _, fileInfo := range filesInfo {
		wg.Add(1)
		workerPool <- struct{}{}

		go func(fileInfo *WxapkgFile) {
			defer func() {
				<-workerPool
				wg.Done()
				// 强制垃圾回收
				runtime.GC()
				debug.FreeOSMemory()
			}()

			filename := filepath.Join(outputDir, fileInfo.Name)
			content := data[fileInfo.Offset : fileInfo.Offset+fileInfo.Size]
			ext := strings.ToLower(filepath.Ext(fileInfo.Name))
			if r.beauty {
				var t []byte
				var err2 error

				switch ext {
				case ".js":
					t, err2 = r.jsBeautifier.Beauty(content)
				case ".html":
					t, err2 = r.htmlBeautifier.Beauty(content)
				case ".json":
					t, err2 = r.jsonBeautifier.Beauty(content)
				default:
					fileChan <- filename
					return
				}

				if err2 != nil {
					errChan <- err2
					return
				}
				content = t
			}

			// 创建目录
			dir := filepath.Dir(filename)
			if err := os.MkdirAll(dir, 0755); err != nil {
				errChan <- err
				return
			}

			// 使用缓冲写入
			if err := utils.WriteFile(filename, content, 0764); err != nil {
				errChan <- err
				return
			}

			fileChan <- filename
		}(fileInfo)
	}

	// 等待所有goroutine完成
	go func() {
		wg.Wait()
		close(fileChan)
		close(errChan)
	}()

	// 收集结果
	for filename := range fileChan {
		filesName = append(filesName, filename)
	}

	return filesName
}

func (r *WeChat) readFileName(reader *bytes.Reader) (string, error) {
	var nameLen uint32
	if err := utils.ReadBinary(reader, &nameLen); err != nil {
		return "", fmt.Errorf("读取文件名长度失败: %v", err)
	}

	if nameLen == 0 || nameLen > 1024 {
		return "", fmt.Errorf("文件名长度 %d 不合理", nameLen)
	}

	nameBytes := make([]byte, nameLen)
	if _, err := io.ReadAtLeast(reader, nameBytes, int(nameLen)); err != nil {
		return "", fmt.Errorf("读取文件名失败: %v", err)
	}
	return string(nameBytes), nil
}

func (r *WeChat) getFilesInfo(data []byte) ([]*WxapkgFile, error) {
	reader := bytes.NewReader(data)

	// 读取文件头
	var firstMark byte
	if err := utils.ReadBinary(reader, &firstMark); err != nil {
		return nil, fmt.Errorf("读取首标记失败: %v", err)
	}
	if firstMark != 0xBE {
		return nil, fmt.Errorf("无效的wxapkg文件: 首标记不正确")
	}

	var info1, indexInfoLength, bodyInfoLength uint32
	if err := utils.ReadBinary(reader, &info1); err != nil {
		return nil, fmt.Errorf("读取info1失败: %v", err)
	}
	if err := utils.ReadBinary(reader, &indexInfoLength); err != nil {
		return nil, fmt.Errorf("读取索引段长度失败: %v", err)
	}
	if err := utils.ReadBinary(reader, &bodyInfoLength); err != nil {
		return nil, fmt.Errorf("读取数据段长度失败: %v", err)
	}

	// 验证长度的合理性
	totalLength := uint64(indexInfoLength) + uint64(bodyInfoLength)
	if totalLength > uint64(len(data)) {
		return nil, fmt.Errorf("文件长度不足, 文件损坏: 索引段(%d) + 数据段(%d) > 文件总长度(%d)", indexInfoLength, bodyInfoLength, len(data))
	}
	totalLength = uint64(len(data))

	var lastMark byte
	if err := utils.ReadBinary(reader, &lastMark); err != nil {
		return nil, fmt.Errorf("读取尾标记失败: %v", err)
	}
	if lastMark != 0xED {
		return nil, fmt.Errorf("无效的wxapkg文件: 尾标记不正确")
	}

	var fileCount uint32
	if err := utils.ReadBinary(reader, &fileCount); err != nil {
		return nil, fmt.Errorf("读取文件数量失败: %v", err)
	}

	// 计算索引段的预期结束位置
	expectedIndexEnd := uint64(reader.Size()) - uint64(bodyInfoLength)

	// 读取索引
	fileList := make([]*WxapkgFile, fileCount)
	var fileListNames []string
	for i := range fileList {
		t := &WxapkgFile{}

		// 获取文件名
		name, err := r.readFileName(reader)
		if err != nil {
			return nil, err
		}
		t.Name = name

		if err := utils.ReadBinary(reader, &t.Offset); err != nil {
			return nil, fmt.Errorf("读取文件偏移量失败: %v", err)
		}
		if err := utils.ReadBinary(reader, &t.Size); err != nil {
			return nil, fmt.Errorf("读取文件大小失败: %v", err)
		}

		// 验证文件偏移量和大小
		fileEnd := uint64(t.Offset) + uint64(t.Size)
		if fileEnd > totalLength {
			return nil, fmt.Errorf("文件 %s 的结束位置 (%d) 超出了文件总长度 (%d)", t.Name, fileEnd, totalLength)
		}

		// 验证我们是否仍在索引段内
		currentPos := uint64(reader.Size()) - uint64(reader.Len())
		if currentPos > expectedIndexEnd {
			return nil, fmt.Errorf("索引读取超出预期范围: 当前位置 %d, 预期索引结束位置 %d", currentPos, expectedIndexEnd)
		}

		fileListNames = append(fileListNames, name)
		fileList[i] = t
	}

	// 验证是否正确读完了整个索引段
	currentPos := uint64(reader.Size()) - uint64(reader.Len())
	if currentPos != expectedIndexEnd {
		return nil, fmt.Errorf("索引段长度不符: 读取到位置 %d, 预期结束位置 %d", currentPos, expectedIndexEnd)
	}

	return fileList, nil
}

func (r *WeChat) QueryMimiAPPInfo(appid string) (*wechat.Info, error) {
	req := service.NewRequest()
	req.Method = "POST"
	req.BodyParams.Set("appid", appid)
	req.BodyParams.Decorate(req)
	bodyBytes, err := req.Fetch(r.http, "https://kainy.cn/api/weapp/info/", func(response *http.Response) error {
		if response.StatusCode != 200 {
			return errors.New(response.Status)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	code := gjson.Get(string(bodyBytes), "code").Int()
	msg := gjson.Get(string(bodyBytes), "error").String()
	if code != 0 && code != 2 { //code = 2表示未收录
		return nil, errors.New(msg)
	}
	result := &wechat.Info{
		AppID: appid,
	}
	result.Nickname = gjson.Get(string(bodyBytes), "data.nickname").String()
	result.Username = gjson.Get(string(bodyBytes), "data.username").String()
	result.Description = gjson.Get(string(bodyBytes), "data.description").String()
	result.Avatar = gjson.Get(string(bodyBytes), "data.avatar").String()
	result.UsesCount = gjson.Get(string(bodyBytes), "data.uses_count").String()
	result.PrincipalName = gjson.Get(string(bodyBytes), "data.principal_name").String()
	return result, nil
}

func (r *WeChat) EnableBeauty(enable bool) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.beauty = enable
}
