package wxMiniprogram

import (
	"os"
	"path/filepath"
	"strings"
)

func SaveFile(dir string, buf []byte, items []SubFileInfo) error {
	absFilepath, err := ConvertToAbsFilepath(dir)
	if err != nil {
		return err
	}
	for _, item := range items {
		subPath := item.Name
		if strings.HasPrefix(item.Name, "/") {
			subPath = "." + subPath
		}
		path := filepath.Join(absFilepath, subPath)
		err := WriteContentToFile(path, buf[item.Off:item.Off+item.Size])
		if err != nil {
			return err
		}
	}
	return nil
}

func DealWithAppServerJs(outputDir string) error {
	if exist, _ := FilePathExist(filepath.Join(outputDir, "app-config.json")); exist {
		if err := DoConfig(filepath.Join(outputDir, "app-config.json")); err != nil {
			return err
		}
	}

	if exist, _ := FilePathExist(filepath.Join(outputDir, "app-service.js")); exist {
		SplitJs(filepath.Join(outputDir, "app-service.js"), "")
	}

	//if fs.existsSync(path.resolve(dir, "app-service.js")) {
	//	wuJs.splitJs(path.resolve(dir, "app-service.js"), doBack, mainDir)
	//	console.log('deal js ok')
	//}

	return nil
}

func DoFile(wxapkg string) {
	bytes, err := os.ReadFile(wxapkg)
	if err != nil {
		return
	}
	apkgInfo, err := GetApkgInfo(bytes)
	if err != nil {
		return
	}
	outputDir := ChangeExt(wxapkg, "")
	SaveFile(outputDir, bytes, apkgInfo.Files)
	if exist, _ := FilePathExist(filepath.Join(outputDir, "app-service.js")); exist {
		DealWithAppServerJs(outputDir)
	}

}
