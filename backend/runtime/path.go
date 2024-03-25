package runtime

import (
	"encoding/base64"
	"fine/backend/logger"
	"os"
	"path/filepath"
	"strings"
)

type Path struct {
}

func NewPath() *Path {
	return &Path{}
}

func (r *Path) Join(path []string) string {
	return filepath.Join(path...)
}

func (r *Path) Dir(path string) string {
	return filepath.Dir(path)
}

func (r *Path) Abs(path string) (string, error) {
	return filepath.Abs(path)
}

func (r *Path) Exist(filename string) bool {
	_, err := os.Stat(filename)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}

func (r *Path) WriteBase64edBytesToFile(path, base64Str string) error {
	decodeString, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return err
	}
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, os.ModeDir); err != nil {
		return err
	}
	if err := os.WriteFile(path, decodeString, 0644); err != nil {
		return err
	}
	return nil
}

func (r *Path) GetAbsFilenameAllByDir(dir, extension string) ([]string, error) {
	var fileList []string
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	for _, file := range files {
		// 获取文件或目录的绝对路径
		filePath := filepath.Join(dir, file.Name())
		// 判断是否是文件
		if file.Type().IsRegular() {
			if strings.HasSuffix(file.Name(), extension) {
				fileList = append(fileList, filePath)
			}
		} else if file.IsDir() {
			files, err := r.GetAbsFilenameAllByDir(filePath, extension)
			if err != nil {
				continue
			}
			fileList = append(fileList, files...)
		} else {
			logger.Info(filePath)
		}
	}
	return fileList, nil
}

func (r *Path) GetRelativeFilenameAllByDir(dir, extension string) ([]string, error) {
	var fileList []string
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	for _, file := range files {
		// 获取文件或目录的绝对路径
		filePath := filepath.Join(dir, file.Name())
		// 判断是否是文件
		if file.Type().IsRegular() {
			if strings.HasSuffix(file.Name(), extension) {
				fileList = append(fileList, filePath)
			}
		} else if file.IsDir() {
			files, err := r.GetAbsFilenameAllByDir(filePath, extension)
			if err != nil {
				continue
			}
			fileList = append(fileList, files...)
		} else {
			// 其他类型的文件
			logger.Info(filePath)
		}
	}
	return fileList, nil
}

func (r *Path) GetAbsSubDirByDir(dir, extension string) ([]string, error) {
	var fileList []string
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	for _, file := range files {
		// 获取文件或目录的绝对路径
		filePath := filepath.Join(dir, file.Name())
		// 判断是否是文件
		if file.Type().IsRegular() {
			if strings.HasSuffix(file.Name(), extension) {
				fileList = append(fileList, filePath)
			}
		} else if file.IsDir() {
			files, err := r.GetAbsFilenameAllByDir(filePath, extension)
			if err != nil {
				continue
			}
			fileList = append(fileList, files...)
		} else {
			// 其他类型的文件
			logger.Info(filePath)
		}
	}
	return fileList, nil
}

func (r *Path) RemoveAll(path string, reserveRoot bool) error {
	if !reserveRoot {
		return os.RemoveAll(path)
	}
	return filepath.Walk(path, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if path == p {
			return nil
		}
		return os.RemoveAll(p)
	})
}
