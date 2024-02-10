package wxMiniprogram

import (
	"encoding/binary"
	"fine/backend/utils"
	"fmt"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"os"
	"path/filepath"
	"strings"
)

type ApkgInfo struct {
	firstMark      byte
	unknownInfo    uint32
	infoListLength uint32
	dataLength     uint32
	lastMark       byte
	fileCount      uint32
	fileInfo       []fileInfo
}

type fileInfo struct {
	name string
	off  uint32
	size uint32
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
		var info fileInfo
		nameLen := binary.BigEndian.Uint32(buf[off : off+4])
		off += 4
		info.name = string(buf[off : off+int(nameLen)])
		off += int(nameLen)
		info.off = binary.BigEndian.Uint32(buf[off : off+4])
		off += 4
		info.size = binary.BigEndian.Uint32(buf[off : off+4])
		off += 4
		apkgInfo.fileInfo = append(apkgInfo.fileInfo, info)
	}
	return apkgInfo, nil
}

func SplitFile(buf []byte, fileInfoList []fileInfo, dataDir string) {
	dataDir, _ = filepath.Abs(dataDir)
	for _, info := range fileInfoList {
		var filename string
		if strings.HasPrefix(info.name, "/") {
			filename = "." + info.name
		}
		filePath := filepath.Join(dataDir, filename)
		err := os.WriteFile(filePath, buf[info.off:info.off+info.size], 0644)
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

func DoConfig(filename string) (any, any, any) {
	abs, err := filepath.Abs(filename)
	if err != nil {
		return nil, nil, nil
	}
	bytes, err := os.ReadFile(abs)
	if err != nil {
		return nil, nil, nil
	}
	content := string(bytes)
	var pages = gjson.Get(content, "pages").Array()
	var entryPagePath = gjson.Get(content, "entryPagePath").String()
	entryPagePath = ChangeExt(entryPagePath, "")
	newPages := make([]string, 0, len(pages)+1)
	newPages = append(newPages, entryPagePath)
	for _, page := range pages {
		if page.String() != entryPagePath {
			newPages = append(newPages, page.String())
		}
	}

	var window = gjson.Get(content, "global.window")
	var tabBar = gjson.Get(content, "tabBar")
	//var networkTimeout = gjson.Get(content, "networkTimeout")
	var subPackages = gjson.Get(content, "subPackages").Array()
	if len(subPackages) > 0 {
		//var newSubPackages []string
		//var tmpPages []string

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
			var sbuPages []string
			var subPackagePages = gjson.Get(subPackage.Raw, "pages").Array()
			for _, page := range subPackagePages {
				replacedPage := strings.Replace(page.String(), root, "", 1)
				sbuPages = append(sbuPages, replacedPage)
				for index, page := range newPages {
					if page == root+replacedPage {
						//注意数组越界
						newPages = append(newPages[0:index], newPages[index+1:]...)
						break
					}
				}
			}
			sjson.Set(subPackage.Raw, "root", root)
			sjson.Set(subPackage.Raw, "pages", sbuPages)
			//newSubPackages = append(newSubPackages, subPackage)
		}
	}

	return window, tabBar, subPackages
	//var app = map[string]any{}
	//let app = {pages: k, window: e.global && e.global.window, tabBar: e.tabBar, networkTimeout: e.networkTimeout};
}
