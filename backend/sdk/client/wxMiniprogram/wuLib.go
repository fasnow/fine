package wxMiniprogram

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"github.com/goccy/go-json"
	"github.com/tidwall/gjson"
	"os"
	"path/filepath"
	"strings"
)

func ChangeExt(name, ext string) string {
	return name[0:strings.LastIndex(name, ".")] + ext
}
func Mkdirs(dir string) error {
	// 检查目录是否存在
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// 递归创建目录
		if err := os.MkdirAll(dir, os.ModePerm); err != nil {
			return err
		}
	}

	// 检查目录是否为文件
	if info, err := os.Stat(dir); err != nil {
		return err
	} else if !info.IsDir() {
		return fmt.Errorf("%s is a file", dir)
	}

	return nil
}

func WriteContentToFile(path string, content []byte) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, os.ModeDir); err != nil {
		return err
	}
	if err := os.WriteFile(path, content, 0644); err != nil {
		return err
	}
	return nil
}

func ToDir(to, from string) string {
	if strings.HasPrefix(from, ".") {
		from = from[1:]
	}
	if strings.HasPrefix(to, ".") {
		to = to[1:]
	}
	from = strings.ReplaceAll(from, "\\", "/")
	to = strings.ReplaceAll(to, "\\", "/")

	a := len(to)
	if len(from) < a {
		a = len(from)
	}
	for i := 1; i <= a; i++ {
		if !strings.HasPrefix(to, from[:i]) {
			a = i - 1
			break
		}
	}

	pub := from[:a]
	length := strings.LastIndex(pub, "/") + 1
	k := from[length:]
	var ret strings.Builder
	for _, ch := range k {
		if ch == '/' {
			ret.WriteString("../")
		}
	}
	return ret.String() + to[length:]
}

func ScanDirByExt(dir, ext string) []string {
	var fileList []string
	// 读取目录内容
	files, err := os.ReadDir(dir)
	if err != nil {
		fmt.Println("Error reading directory:", err)
		return nil
	}
	for _, file := range files {
		// 获取文件或目录的绝对路径
		filePath := filepath.Join(dir, file.Name())

		// 判断是否是文件
		if file.Type().IsRegular() {
			if strings.HasSuffix(file.Name(), ext) {
				fileList = append(fileList, filePath)
			}
		} else if file.IsDir() {
			fileList = append(fileList, ScanDirByExt(filePath, ext)...)
		} else {
			// 其他类型的文件
			fmt.Println("Unknown file type:", filePath)
		}
	}
	return fileList
}

func FixDir(baseDir, absFilePath string) string {
	if strings.HasPrefix(absFilePath, baseDir) {
		return absFilePath[len(baseDir)+1:]
	}
	return absFilePath
}

func SHA256HashByBytes(data []byte) string {
	hash := md5.New()
	hash.Write(data)
	hashBytes := hash.Sum(nil)
	hashString := hex.EncodeToString(hashBytes)
	return hashString
}

func SHA256HashByBase64(base64Data string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", err
	}
	hash := SHA256HashByBytes(data)
	return hash, nil
}
func JsonToMap(text gjson.Result) (map[string]any, error) {
	var formatMap map[string]interface{}
	if err := json.Unmarshal([]byte(text.Raw), &formatMap); err != nil {
		return nil, err
	}
	return formatMap, nil
}

func ConvertToAbsFilepath(path string) (string, error) {
	if filepath.IsAbs(path) {
		return path, nil
	}
	abs, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	return abs, nil
}

func FilePathExist(path string) (bool, error) {
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return false, err
		} else {
			return true, err
		}
	}
	return true, nil
}
