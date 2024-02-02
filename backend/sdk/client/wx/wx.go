package wechat

import (
	"archive/zip"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha1"
	"fmt"
	"golang.org/x/crypto/pbkdf2"
	"io/ioutil"
	"os"
	"path/filepath"
)

func Decrypt(wxapkgPath string, wxid, salt, iv, output string) error {
	dataByte, err := ioutil.ReadFile(wxapkgPath)
	if err != nil {
		return err
	}
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
	originData = append(originData[:1023], afData...)
	err = ioutil.WriteFile(output, originData, 0666)
	if err != nil {
		return err
	}
	return nil
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
