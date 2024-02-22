package wxMiniprogram

import (
	"encoding/binary"
	"fine/backend/utils"
	"fmt"
	"github.com/goccy/go-json"
	"github.com/robertkrimen/otto"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type ApkgInfo struct {
	firstMark      byte
	unknownInfo    uint32
	infoListLength uint32
	dataLength     uint32
	lastMark       byte
	fileCount      uint32
	Files          []SubFileInfo
}

type SubFileInfo struct {
	Name string
	Off  uint32
	Size uint32
}

func GetApkgInfo(buf []byte) (*ApkgInfo, error) {
	apkgInfo := &ApkgInfo{}
	apkgInfo.lastMark = buf[13]
	if apkgInfo.lastMark != 0xbe && apkgInfo.lastMark != 0xed {
		return nil, fmt.Errorf("wrong magic number")
	}
	apkgInfo.firstMark = buf[0]
	apkgInfo.unknownInfo = binary.BigEndian.Uint32(buf[1:5])
	apkgInfo.infoListLength = binary.BigEndian.Uint32(buf[5:9])
	apkgInfo.dataLength = binary.BigEndian.Uint32(buf[9:13])

	apkgInfo.fileCount = binary.BigEndian.Uint32(buf[14:18])
	off := 14 + 4
	for i := 0; i < int(apkgInfo.fileCount); i++ {
		var info SubFileInfo
		nameLen := binary.BigEndian.Uint32(buf[off : off+4])
		off += 4
		info.Name = string(buf[off : off+int(nameLen)])
		off += int(nameLen)
		info.Off = binary.BigEndian.Uint32(buf[off : off+4])
		off += 4
		info.Size = binary.BigEndian.Uint32(buf[off : off+4])
		off += 4
		apkgInfo.Files = append(apkgInfo.Files, info)
	}
	return apkgInfo, nil
}

func SplitFile(buf []byte, fileInfoList []SubFileInfo, dataDir string) {
	dataDir, _ = filepath.Abs(dataDir)
	for _, info := range fileInfoList {
		var filename string
		if strings.HasPrefix(info.Name, "/") {
			filename = "." + info.Name
		}
		filePath := filepath.Join(dataDir, filename)
		err := os.WriteFile(filePath, buf[info.Off:info.Off+info.Size], 0644)
		if err != nil {
			continue
		}
		fmt.Printf("文件保存成功: %s\n", filePath)
	}
}

func PackDone(dataDir string) {

}

func DealThreeThings(dir, mainDir, nowDir string) {
	if utils.FileExists(dir) {

	}
}

func DoConfig(configFilename string) error {
	abs, err := filepath.Abs(configFilename)
	if err != nil {
		return err
	}
	dir := filepath.Dir(abs)
	bytes, err := os.ReadFile(abs)
	if err != nil {
		return err
	}
	content := string(bytes)
	var pages = gjson.Get(content, "pages").Array()

	var entryPagePath = gjson.Get(content, "entryPagePath").String()
	newPages := make([]string, 0, len(pages)+1)
	if entryPagePath != "" {
		entryPagePath = ChangeExt(entryPagePath, "")
		newPages = append(newPages, entryPagePath)
	}
	for _, page := range pages {
		if page.String() != entryPagePath {
			newPages = append(newPages, page.String())
		}
	}
	var window, _ = JsonToMap(gjson.Get(content, "global.window"))
	var tabBar, _ = JsonToMap(gjson.Get(content, "tabBar"))
	var networkTimeout, _ = JsonToMap(gjson.Get(content, "networkTimeout"))

	var app = map[string]any{
		"pages":          newPages,
		"window":         window,
		"tabBar":         tabBar,
		"networkTimeout": networkTimeout,
	}
	var subPackages = gjson.Get(content, "subPackages").Array()
	if len(subPackages) > 0 {
		var appSubPackages []map[string]any
		for _, subPackage := range subPackages {
			root := gjson.Get(subPackage.Raw, "root").String()
			lastChar := root[len(root)-1:]
			if lastChar != "/" {
				root = root + "/"
			}
			firstChar := root[:1]
			if firstChar == "/" {
				root = root[1:]
			}
			var subPagez []string
			var subPackagePages = gjson.Get(subPackage.Raw, "pages").Array()
			if len(subPackagePages) == 0 {
				continue
			}
			for _, page := range subPackagePages {
				replacedPage := strings.Replace(page.String(), root, "", 1)
				subPagez = append(subPagez, replacedPage)
				for index, page := range newPages {
					if page == root+replacedPage {
						//没有处理数组越界情况
						newPages = append(newPages[0:index], newPages[index+1:]...)
						break
					}
				}
			}
			newSubPackage, err := sjson.Set(subPackage.Raw, "root", root)
			if err != nil {
				return err
			}
			newSubPackage, err = sjson.Set(newSubPackage, "pages", subPagez)
			if err != nil {
				return err
			}
			if mapFormattedData, err := JsonToMap(gjson.Parse(newSubPackage)); err != nil {
				return err
			} else {
				appSubPackages = append(appSubPackages, mapFormattedData)
			}
		}
		app["subPackages"] = appSubPackages
		app["pages"] = newPages
	}
	navigateToMiniProgramAppIdList := gjson.Get(content, "navigateToMiniProgramAppIdList").String()
	if navigateToMiniProgramAppIdList != "" {
		app["navigateToMiniProgramAppIdList"] = navigateToMiniProgramAppIdList
	}

	if utils.FileExists(filepath.Join(dir, "workers.js")) {
		app["workers"], _ = getWorkerPath(filepath.Join(dir, "workers.js"))
	}
	extAppid := gjson.Get(content, "extAppid").String()
	if extAppid != "" {
		app["navigateToMiniProgramAppIdList"] = navigateToMiniProgramAppIdList
	}
	ext := gjson.Get(content, "ext").String()
	if ext != "" {
		if jsonData, err := json.MarshalIndent(map[string]any{
			"extEnable": true,
			"extAppID":  extAppid,
			"ext":       ext,
		}, "", "    "); err != nil {
			return err
		} else if err = WriteContentToFile(filepath.Join(dir, "ext.json"), jsonData); err != nil {
			return err
		}

	}
	debug := gjson.Get(content, "debug").String()
	if len(debug) > 0 {
		app["debug"] = debug
	}
	cur, _ := filepath.Abs("./file")
	page := gjson.Get(content, "page").Map()
	for k, p := range page {
		pMap := p.Map()
		ppMap := pMap["window"].Map()["usingComponents"].Map()
		for key, _ := range ppMap {
			componentPath := ppMap[key].String() + "\\.html" //sjson.Set中设置的键包含 . 需要转义
			if strings.HasPrefix(componentPath, "/") {
				componentPath = componentPath[1:]
			} else {
				f, _ := filepath.Abs(filepath.Join(filepath.Dir(k), componentPath))
				componentPath = ToDir(f, cur)
			}
			if page[componentPath].Raw == "" {
				if content, err = sjson.Set(content, "page."+componentPath, "{}"); err != nil {
					return err
				}
			} else if page[componentPath].Raw != "" && page[componentPath].Map()["window"].Raw == "" {
				if content, err = sjson.Set(content, fmt.Sprintf("page.%s.window", componentPath), "{}"); err != nil {
					return err
				}
			}
			if content, err = sjson.Set(content, fmt.Sprintf("page.%s.window.component", componentPath), true); err != nil {
				return err
			}
		}
	}

	f, _ := filepath.Abs(filepath.Join(dir, "app-service.js"))
	if utils.FileExists(f) {
		appServiceJsContent, err := os.ReadFile(f)
		if err != nil {
			return err
		}
		pattern := `__wxAppCode__\['[^\.]+\.json[^;]+;`
		re := regexp.MustCompile(pattern)
		matches := re.FindAllString(string(appServiceJsContent), -1)
		code := strings.Join(matches, "")
		vm := otto.New()
		_, _ = vm.Run(`var __wxAppCode__ = {};`)
		_, err = vm.Run(code)
		if err != nil {
			return err
		}
		// 获取__wxAppCode__
		wxAppCode, err := vm.Run(`__wxAppCode__;`)
		if err != nil {
			return err
		}
		wxAppCodeObject, err := wxAppCode.Export()
		if err != nil {
			return err
		}
		attachInfo := wxAppCodeObject.(map[string]any)
		for name, _ := range attachInfo {
			if content, err = sjson.Set(content, "page."+ChangeExt(name, "\\.html"), map[string]any{"window": attachInfo[name]}); err != nil {
				return err
			}
		}
	}
	var delWeight = 8
	fmt.Println(delWeight)
	var temp = gjson.Get(content, "page").Map()
	for key, value := range temp {
		var fileName, _ = filepath.Abs(filepath.Join(dir, ChangeExt(key, ".json")))
		mapFormattedData, err := JsonToMap(gjson.Get(value.Raw, "window"))
		if err != nil {
			return err
		}
		jsonData, err := json.MarshalIndent(mapFormattedData, "", "    ")
		if err != nil {
			return err
		}
		err = WriteContentToFile(fileName, jsonData)
		if err != nil {
			return err
		}
		if configFilename == fileName {
			delWeight = 0
		}
	}

	for _, subPackage := range app["subPackages"].([]map[string]any) {
		for _, subPackagePage := range subPackage["pages"].([]string) {
			var a = subPackage["root"].(string) + subPackagePage + ".xx"

			//添加默认的 wxs, wxml, wxss
			var jsName = ChangeExt(a, ".js")
			fileNameOfWxs, err := filepath.Abs(filepath.Join(dir, jsName))
			if err != nil {
				return err
			}
			err = WriteContentToFile(fileNameOfWxs, []byte("// "+jsName+"\nPage({data: {}})"))
			if err != nil {
				return err
			}

			var wxmlName = ChangeExt(a, ".wxml")
			fileNameOfWxml, err := filepath.Abs(filepath.Join(dir, jsName))
			if err != nil {
				return err
			}
			err = WriteContentToFile(fileNameOfWxml, []byte("<!--"+wxmlName+"--><text>"+wxmlName+"</text>"))
			if err != nil {
				return err
			}

			var cssName = ChangeExt(a, ".wxss")
			if fileNameOfWxss, err := filepath.Abs(filepath.Join(dir, cssName)); err != nil {
				return err
			} else {
				if err = WriteContentToFile(fileNameOfWxss, []byte("/* "+cssName+" */")); err != nil {
					return err
				}
			}
		}
	}

	tabBarTemp := app["tabBar"].(map[string]any)
	list := tabBarTemp["list"].([]any)
	if tabBarTemp != nil && list != nil {
		var digests []struct {
			Hash string
			Name string
		}
		files := ScanDirByExt(dir, "")
		for _, file := range files {
			if text, err := os.ReadFile(file); err != nil {
				return err
			} else {
				hash := SHA256HashByBytes(text)
				digests = append(digests, struct{ Hash, Name string }{hash, file})
			}
		}

		for key, tmpItem := range list {
			var item = tmpItem.(map[string]any)
			item["pagePath"] = ChangeExt(item["pagePath"].(string), "")
			var iconData = item["iconData"].(string)
			if iconData != "" {
				hash, _ := SHA256HashByBase64(iconData)
				for _, digest := range digests {
					if digest.Hash == hash {
						delete(item, "iconData")
						item["iconPath"] = strings.ReplaceAll(FixDir(dir, digest.Name), "\\", "/")
						list[key] = item
						break
					}
				}
			}
			var selectedIconData = item["selectedIconData"].(string)
			if selectedIconData != "" {
				hash, _ := SHA256HashByBase64(selectedIconData)
				for _, digest := range digests {
					if digest.Hash == hash {
						delete(item, "selectedIconData")
						item["selectedIconData"] = strings.ReplaceAll(FixDir(dir, digest.Name), "\\", "/")
						list[key] = item
						break
					}
				}
			}

		}
		tabBarTemp["list"] = list
		app["tabBar"] = tabBarTemp["list"]

		if jsonData, err := json.MarshalIndent(app, "", "    "); err != nil {
			return err
		} else {
			if err = WriteContentToFile(filepath.Join(dir, "app.json"), jsonData); err != nil {
				return err
			}
		}
	}

	if jsonData, err := json.MarshalIndent(app, "", "    "); err != nil {
		return err
	} else {
		if err = WriteContentToFile(filepath.Join(dir, "app.json"), jsonData); err != nil {
			return err
		}
	}

	return nil
}

func getWorkerPath(name string) (string, error) {
	// 读取文件内容
	code, err := ioutil.ReadFile(name)
	if err != nil {
		return "", err
	}

	// 使用正则表达式匹配 define 函数调用
	defineRegex := regexp.MustCompile(`define\(([^)]+)\)`)
	matches := defineRegex.FindStringSubmatch(string(code))
	if len(matches) < 2 {
		return "", nil
	}
	modulePath := matches[1]
	commonPath := filepath.Dir(modulePath)
	return commonPath, nil
}
