package utils

import (
	"os"
	"path/filepath"
)

func WriteFile(path string, data []byte, perm os.FileMode) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, perm); err != nil {
		return err
	}
	return os.WriteFile(path, data, perm)
}

// CreateDirectory 根据传入的路径创建文件夹，如果文件夹已存在则不创建
func CreateDirectory(dir string) error {
	if err := os.MkdirAll(dir, 0764); err != nil {
		return err
	}
	return nil
}

// CreateFile 根据传入的路径创建文件，如果文件已存在则不创建
func CreateFile(filePath string) error {
	// 检查文件是否已经存在
	if _, err := os.Stat(filePath); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
		return err
	}

	// 先创建文件所在的文件夹
	dir := filepath.Dir(filePath)
	if err := CreateDirectory(dir); err != nil {
		return err
	}

	// 创建文件并设置权限为 764
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0764)
	if err != nil {
		return err
	}
	defer file.Close()
	return nil
}
