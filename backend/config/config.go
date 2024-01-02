package config

import (
	"errors"
	"fine-server/utils"
	"fmt"
	"gopkg.in/yaml.v3"
	"os"
	"path"
	"path/filepath"
)

func SetBaseDir(dir string) error {
	dir, _ = filepath.Abs(dir)
	baseDir = dir
	file = path.Join(baseDir, "config.yaml")
	dataDir = path.Join(baseDir, "data")
	if err := ifDirNonExistThenCreat(dataDir); err != nil {
		return err
	}
	downloadLogFile = path.Join(baseDir, "download.log")
	if err := ifFileNonExistThenCreat(downloadLogFile); err != nil {
		return err
	}
	tmpCfg, err := getConfig()
	if err != nil {
		return err
	}
	cfg = tmpCfg
	return nil
}

func ifConfNonExistThenCreat() error {
	if _, err := os.Stat(file); err != nil {
		file, err2 := os.OpenFile(file, os.O_RDWR|os.O_CREATE, 0666) // 使用 0666 权限
		if err2 != nil {
			return err2
		}
		defer file.Close()

		marshal, err2 := yaml.Marshal(defaultConfig)
		if err2 != nil {
			return err2
		}
		_, err2 = file.Write(marshal)
		if err2 != nil {
			return err2
		}
	}
	return nil
}

func ifDirNonExistThenCreat(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			return err
		}
	}
	return nil
}

func ifFileNonExistThenCreat(filepath string) error {
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		file, err := os.Create(filepath)
		if err != nil {
			return err
		}
		defer file.Close()
	}
	return nil
}

func GetConfig() Config {
	return cfg
}

func getConfig() (Config, error) {
	conf := &Config{}
	err := ifConfNonExistThenCreat()
	if err != nil {
		fmt.Println(err)
		err := utils.FormatError(errors.New(err.Error() + "---" + file))
		if err != nil {
			return Config{}, err
		}
		return *conf, err
	}
	file, err := os.Open(file)
	defer file.Close()
	if err != nil {
		return *conf, err
	}

	fileInfo, err := file.Stat() //获取文件属性
	if err != nil {
		return *conf, err
	}

	fileSize := fileInfo.Size() //文件大小
	if fileSize == 0 {
		return *conf, nil
	}
	buffer := make([]byte, fileSize) //设置一个byte的数组(buffer)
	_, err = file.Read(buffer)       //读文件
	if err != nil {
		return *conf, err
	}
	err = yaml.Unmarshal(buffer, conf)
	if err != nil { //一定要加这个判断，或者调用者不做错误处理
		return *conf, err
	}
	return *conf, nil
}

func SaveConf(conf Config) (err error) {
	err = ifConfNonExistThenCreat()
	if err != nil {
		return err
	}
	marshal, err := yaml.Marshal(conf)
	if err != nil {
		return err
	}
	err = os.WriteFile(file, marshal, 0666)
	if err == nil {
		cfg = conf
	}
	return err
}

func CheckAuth(name string) bool {
	switch name {
	case FofaName:
		return cfg.Auth.Fofa.Key != ""
	case HunterName:
		return cfg.Auth.Hunter.Key != ""
	case QuakeName:
		return cfg.Auth.Quake.Key != ""
	case ZoneName:
		return cfg.Auth.Zone.Key != ""
	default:
		return false
	}
}

func GetConfigBaseDir() string {
	return baseDir
}

func GetDataBaseDir() string {
	return dataDir
}
