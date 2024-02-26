package wechat

import (
	"archive/zip"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"fine/backend/config"
	"fmt"
	"golang.org/x/crypto/pbkdf2"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
)

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

// FileNode 表示文件结构树的节点
type FileNode struct {
	Name     string      `json:"name"`
	IsDir    bool        `json:"isDir"`
	Children []*FileNode `json:"children,omitempty"`
}

// 获取 Zip 文件的文件结构
func getFileStructure(zipPath string) (*FileNode, error) {
	file, err := os.Open(zipPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	zipReader, err := zip.NewReader(file, fileStat(file).Size())
	if err != nil {
		return nil, err
	}

	root := &FileNode{Name: "", IsDir: true, Children: []*FileNode{}}

	for _, file := range zipReader.File {
		addFileToNode(file, root)
	}

	return root, nil
}

// 将文件添加到文件结构树的节点
func addFileToNode(file *zip.File, node *FileNode) {
	components := splitPath(file.Name)

	for _, component := range components {
		var child *FileNode
		for _, n := range node.Children {
			if n.Name == component {
				child = n
				break
			}
		}

		if child == nil {
			child = &FileNode{Name: component, IsDir: file.FileInfo().IsDir(), Children: []*FileNode{}}
			node.Children = append(node.Children, child)
		}

		node = child
	}
}

// 获取 Zip 文件中指定文件的内容
func getFileContent(zipPath, fileName string) ([]byte, error) {
	fileName = filepath.ToSlash(fileName)
	file, err := os.Open(zipPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	zipReader, err := zip.NewReader(file, fileStat(file).Size())
	if err != nil {
		return nil, err
	}

	for _, file := range zipReader.File {
		if file.Name == fileName {
			contentReader, err := file.Open()
			if err != nil {
				return nil, err
			}
			defer contentReader.Close()

			content, err := ioutil.ReadAll(contentReader)
			if err != nil {
				return nil, err
			}

			return content, nil
		}
	}

	return nil, fmt.Errorf("File not found: %s", fileName)
}

// 将文件路径拆分为组件
func splitPath(path string) []string {
	return filepath.SplitList(filepath.Clean(path))
}

func fileStat(file *os.File) os.FileInfo {
	stat, err := file.Stat()
	if err != nil {
		panic(err)
	}
	return stat
}

type WxMiniProgram struct {
	appletPath string
}

func NewClient() *WxMiniProgram {
	return &WxMiniProgram{}
}

// WxapkgInfo 表示包含 _APP_.wxapkg 的目录信息
type WxapkgInfo struct {
	Path       string       `json:"path"` // 目录路径
	UpdateDate string       `json:"updateDate"`
	SubDirs    []WxapkgInfo `json:"subDirs"` // 子目录信息
}

func (r *WxMiniProgram) SetAppletPath(path string) {
	r.appletPath = path
}

// GetAppletSubDir 扫描目录，找到包含 _APP_.wxapkg 的目录结构
func (r *WxMiniProgram) GetAppletSubDir() (*WxapkgInfo, error) {
	wechat := config.GetSingleton().GetWechat()
	var result = &WxapkgInfo{}
	result.Path = wechat.AppletPath
	entries, err := os.ReadDir(wechat.AppletPath)
	if err != nil {
		return nil, err
	}
	// 按修改时间排序
	sort.Sort(FileInfoSlice(entries))
	for _, dirEntry := range entries {
		if dirEntry.IsDir() {
			subPath := filepath.Join(wechat.AppletPath, dirEntry.Name())
			versionEntries, err := os.ReadDir(subPath)
			if err != nil {
				return nil, err
			}
			// 按修改时间排序
			sort.Sort(FileInfoSlice(versionEntries))
			if dirEntry.IsDir() {
				var subResult WxapkgInfo
				subResult.Path = dirEntry.Name()
				info, _ := dirEntry.Info()
				subResult.UpdateDate = info.ModTime().Format("2006/01/02 15:04")
				for _, versionEntry := range versionEntries {
					var file = filepath.Join(subPath, versionEntry.Name(), "__APP__.wxapkg")
					fileInfo, err := os.Stat(file)
					if err != nil {
						continue
					}
					subResult.SubDirs = append(subResult.SubDirs, WxapkgInfo{
						Path:       versionEntry.Name(),
						UpdateDate: fileInfo.ModTime().Format("2006/01/02 15:04"),
					})
				}
				if len(subResult.SubDirs) > 0 {
					result.SubDirs = append(result.SubDirs, subResult)
				}
			}
		}
	}
	return result, err
}

type FileInfoSlice []os.DirEntry

func (f FileInfoSlice) Len() int {
	return len(f)
}

func (f FileInfoSlice) Less(i, j int) bool {
	info1, err := f[i].Info()
	if err != nil {
		fmt.Println("Error:", err)
		return false
	}
	info2, err := f[j].Info()
	if err != nil {
		fmt.Println("Error:", err)
		return false
	}
	return info1.ModTime().After(info2.ModTime())
}

func (f FileInfoSlice) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}
