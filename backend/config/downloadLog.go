package config

import (
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
)

type DownloadLogItem struct {
	Dir      string `yaml:"dir,omitempty" json:"dir,omitempty"`
	Filename string `yaml:"filename" json:"filename,omitempty"`
	Exist    bool   `json:"exist" json:"exist,omitempty"`
}

func AddDownloadLogItem(filename string) error {
	var logItems []*DownloadLogItem
	_, err := os.Stat(downloadLogFile) // 判断文件存在与否，不存在则创建，创建后无内容所以直接返回
	if err != nil {
		file, err2 := os.OpenFile(downloadLogFile, os.O_RDWR|os.O_CREATE, 0666) // 使用 0666 权限
		if err2 != nil {
			return err2
		}
		file.Close()
	} else {
		logItems, err = GetDownloadLog(0, -1)
		if err != nil {
			return err
		}
	}
	item := &DownloadLogItem{
		Dir:      dataDir,
		Filename: filename,
	}
	logItems = append([]*DownloadLogItem{item}, logItems...)
	yamlData, err := yaml.Marshal(&logItems)
	if err != nil {
		return err
	}
	err = os.WriteFile(downloadLogFile, yamlData, 0666)
	if err != nil {
		return err
	}
	return nil
}

func GetDownloadLog(start, limit int) ([]*DownloadLogItem, error) {
	_, err := os.Stat(downloadLogFile) // 判断文件存在与否，不存在则创建，创建后无内容所以直接返回
	if err != nil {
		return make([]*DownloadLogItem, 0), nil
	}
	yamlFile, err := os.ReadFile(downloadLogFile)
	if err != nil {
		return nil, err
	}
	var items []*DownloadLogItem
	var subItems []*DownloadLogItem
	err = yaml.Unmarshal(yamlFile, &items)
	if err != nil {
		return nil, err
	}
	if start >= len(items) {
		return make([]*DownloadLogItem, 0), nil
	}
	if limit == -1 {
		subItems = items[start:]
	} else {
		var end = start + limit
		if end <= len(items) {
			subItems = items[start:end]
		} else {
			subItems = items[start:]
		}

	}
	return subItems, nil
}

func RemoveItem(filename, dir string) error {
	logItems, err := GetDownloadLog(0, -1)
	if err != nil {
		return err
	}
	for i := 0; i < len(logItems); i++ {
		if logItems[i].Dir == dir && logItems[i].Filename == filename {
			err2 := os.Remove(filepath.Join(dir, filename))
			if err2 != nil {
				return err2
			}
		}
	}
	return nil
}

func ClearLog() error {
	err := os.Remove(downloadLogFile)
	if err != nil {
		return err
	}
	return nil
}
