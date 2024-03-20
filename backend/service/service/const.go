package service

import (
	"errors"
	"fine/backend/service/model/wechat"
)

const (
	FofaDefaultPageSize   = 200
	HunterDefaultPageSize = 20
	ZoneDefaultPageSize   = 40
	QuakeDefaultPageSize  = 20
)
const (
	WrongJsonFormat                   = "looking for beginning of value"
	QuakeUnexpectedJsonResponse       = "unexpected json response"
	QuakeInvalidKey                   = "invalid key"
	QuakeUnauthorized                 = "/quake/login"
	UnexpectedResponse                = "unexpected response"
	QuakeUnexpectedJsonResponseOfUser = "unexpected user structure"
)

var (
	UnexpectedStructureError      = errors.New("服务端返回非预期数据")
	UnexpectedQueryTypeError      = errors.New("unexpected query type")
	UnexpectedQueryStatementError = errors.New("unexpected query statement")
	UnexpectedFieldTypeError      = errors.New("unexpected field type")
	ErrorQueryStatement           = errors.New("查询语句不能为空")
	ErrorQueryPage                = errors.New("页码必须大于0")
	ErrorQuerySize                = errors.New("分页大小必须大于0")
	NonStatusOK                   = errors.New("服务端返回非200响应码")
)

type TT struct {
}

func (r *TT) GetAllMiniProgram() ([]wechat.MiniProgram, error) {
	//appletPath := config.GetSingleton().GetWechat().AppletPath
	//items := make([]wechat.MiniProgram, 0)
	//entries, err := os.ReadDir(appletPath)
	//if err != nil {
	//	return nil, err
	//}
	//// 按修改时间排序
	//sort.Sort(FileInfoSlice(entries))
	//for _, entry := range entries {
	//	if entry.IsDir() {
	//		versionsPath := filepath.Join(appletPath, entry.Name())
	//		versionEntries, err := os.ReadDir(versionsPath)
	//		if err != nil {
	//			return nil, err
	//		}
	//		// 按修改时间排序
	//		sort.Sort(FileInfoSlice(versionEntries))
	//		var versions []wechat.Version
	//		for _, versionEntry := range versionEntries {
	//			var file = filepath.Join(versionsPath, versionEntry.Name(), "__APP__.wxapkg")
	//			fileInfo, err := os.Stat(file)
	//			if err != nil {
	//				continue
	//			}
	//			versions = append(versions, wechat.Version{
	//				Number:     versionEntry.Name(),
	//				UpdateDate: fileInfo.ModTime().Format("2006/01/02 15:04"),
	//			})
	//		}
	//		if len(versions) > 0 {
	//			info, _ := entry.Info()
	//			items = append(items, wechat.MiniProgram{
	//				AppID:      entry.Name(),
	//				UpdateDate: info.ModTime().Format("2006/01/02 15:04"),
	//				Versions:   versions,
	//			})
	//		}
	//	}
	//}
	//
	//for i := 0; i < len(items); i++ {
	//	miniProgram := items[i]
	//	item := r.dbService.FindByAppId(miniProgram.AppID)
	//
	//	//没有就插入新的
	//	if item.AppID == "" {
	//		r.dbService.Insert(miniProgram)
	//		continue
	//	}
	//
	//	//有则判断状态
	//	var newVersions []wechat.Version
	//	for j := 0; j < len(miniProgram.Versions); j++ {
	//		//if miniProgram.Versions[j].Number == item {
	//		//	//miniProgram.Versions[j].Unpacked = true
	//		//	miniPrograms[i].Versions[j].Unpacked = true
	//		//	continue
	//		//}
	//		for _, version := range item.Versions {
	//			t := version
	//			if miniProgram.Versions[j].Number == t.Number {
	//				//miniProgram.Versions[j].Unpacked = true
	//				tt := &items[i].Versions[j].Unpacked
	//				*tt = t.Unpacked
	//				continue
	//			}
	//			//新的版本
	//			if j == len(item.Versions)-1 {
	//				newVersions = append(newVersions, miniProgram.Versions[j])
	//			}
	//		}
	//		//for k := 0; k < 5; k++ {
	//		//	if miniProgram.Versions[j].Number == "51" {
	//		//		//miniProgram.Versions[j].Unpacked = true
	//		//		items[i].Versions[j].Unpacked = true
	//		//		continue
	//		//	}
	//		//}
	//	}
	//	if len(newVersions) > 0 {
	//		r.dbService.AppendVersionByAppID(miniProgram.AppID, newVersions...)
	//	}
	//}
	return A()
}

func A() ([]wechat.MiniProgram, error) {

	miniPrograms := []wechat.MiniProgram{
		{AppID: "11111111111", Versions: []wechat.Version{{Number: "1"}}},
		{AppID: "22222222222", Versions: []wechat.Version{{Number: "2"}}},
	}
	miniPrograms[1].Versions[0].Unpacked = true

	return miniPrograms, nil
}
