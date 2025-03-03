package wechat

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"errors"
	"fine/backend/beauty"
	"fine/backend/constant"
	"fine/backend/matcher"
	"fine/backend/proxy/v2"
	"fine/backend/service/model/wechat"
	"fine/backend/utils"
	"fmt"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/pbkdf2"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
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
}

func New(applet string) *WeChat {
	return &WeChat{
		http: &http.Client{
			Timeout: proxy.DefaultTimeout,
		},
		Applet:         applet,
		jsBeautifier:   beauty.NewJSBeautifier(),
		htmlBeautifier: beauty.NewHTMLBeautifier(),
		jsonBeautifier: beauty.NewJSONBeautifier(),
		matcher:        matcher.New([]string{}),
	}
}

func (r *WeChat) UseProxyManager(manager *proxy.Manager) {
	r.http = manager.GetClient()
}

func (r *WeChat) SetRegex(regexes []string) {
	r.matcher.SetRegex(utils.RemoveEmptyAndDuplicateString(regexes))
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
	sort.Sort(constant.FileInfoSlice(entries))
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
		sort.Sort(constant.FileInfoSlice(versionEntries))
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

func (r *WeChat) ExtractInfo(content string) []string {
	return r.matcher.FindAll(content)
}

func (r *WeChat) unpackFile(data []byte, filesInfo []*WxapkgFile, outputDir string, eventFunc func(err error)) []string {
	var filesName []string
	for _, fileInfo := range filesInfo {
		filename := filepath.Join(outputDir, fileInfo.Name)
		filesName = append(filesName, filename)
		content := data[fileInfo.Offset : fileInfo.Offset+fileInfo.Size]
		ext := strings.ToLower(filepath.Ext(fileInfo.Name))
		var err error
		var t []byte
		switch ext {
		case ".js":
			t, err = r.jsBeautifier.Beauty(content)
		case ".html":
			t, err = r.htmlBeautifier.Beauty(content)
		case ".json":
			t, err = r.jsonBeautifier.Beauty(content)
		default:
			continue
		}
		if err != nil && eventFunc != nil {
			eventFunc(err)
		} else if err == nil {
			content = t
		}
		err = utils.WriteFile(filename, content, 0764)
		if err != nil && eventFunc != nil {
			eventFunc(err)
		}
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
