package fofa

import (
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/db/model"
	"fine/backend/db/service"
	"fine/backend/event"
	"fine/backend/service/model/fofa"
	"fine/backend/service/model/wechat"
	"fine/backend/utils"
	"fmt"
	"github.com/pkg/errors"
	"github.com/yitter/idgenerator-go/idgen"
	"path/filepath"
	"time"
)

type Bridge struct {
	app         *app.App
	fofa        *Fofa
	queryLog    *service.FOFAQueryLog
	downloadLog *service.DownloadLogService
	dataCache   *service.FofaDBService
	cacheTotal  *service.CacheTotal
}

func NewFofaBridge(app *app.App) *Bridge {
	fofaAuth := config.GetSingleton().GetFofaAuth()
	return &Bridge{
		fofa:        NewClient(fofaAuth.Email, fofaAuth.Key),
		queryLog:    service.NewFOFAQueryLog(),
		downloadLog: service.NewDownloadLogService(),
		dataCache:   service.NewFofaDBService(),
		cacheTotal:  service.NewCacheTotal(),
		app:         app,
	}
}

type QueryResult struct {
	*Result
	MaxPage int   `json:"maxPage"`
	TaskID  int64 `json:"id"`
}

func (r *Bridge) Query(taskID int64, query string, page, pageSize int64, fields string, full bool) (*QueryResult, error) {
	queryResult := &QueryResult{
		Result: &Result{},
	}

	//获取缓存
	total, q := r.cacheTotal.GetByTaskID(taskID)
	if total != 0 {
		cacheItems, err := r.dataCache.GetByTaskID(taskID)
		if err != nil {
			return nil, err
		}
		queryResult.Query = q
		queryResult.Total = total
		queryResult.Page = int(page)
		queryResult.Size = int(pageSize)
		queryResult.TaskID = taskID
		for _, cacheItem := range cacheItems {
			queryResult.Items = append(queryResult.Items, cacheItem.Item)
		}
		return queryResult, nil
	}

	//获取新数据
	req := NewGetDataReqBuilder().
		Query(query).
		Page(page).
		Size(pageSize).Fields(fields).Full(full).Build()
	result, err := r.fofa.Get(req)
	if err != nil {
		return nil, err
	}
	if result.Total > 0 {
		id := idgen.NextId()
		if page == 1 {
			// 缓存查询成功的条件，用于导出
			_ = r.queryLog.Add(&model.FOFAQueryLog{
				Query:  query,
				Fields: fields,
				Full:   full,
				Total:  result.Total,
			}, id)
		}
		r.cacheTotal.Add(id, result.Total, query)
		_ = r.dataCache.BatchInsert(id, result.Items)
		queryResult.TaskID = id
	}
	queryResult.Result = result
	return queryResult, nil
}

func (r *Bridge) GetAllMiniProgram() ([]wechat.MiniProgram, error) {
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

func (r *Bridge) Export(taskID int64, page, pageSize int64) error {
	queryLog, err := r.queryLog.GetByTaskID(taskID)
	if err != nil {
		return errors.New("查询后再导出")
	}
	fileID := idgen.NextId()
	dataDir := config.GetBaseDataDir()
	filename := fmt.Sprintf("Fofa_%s.xlsx", utils.GenTimestamp())
	outputAbsFilepath := filepath.Join(dataDir, filename)
	_ = r.downloadLog.Insert(model.DownloadLog{
		Dir:      dataDir,
		Filename: filename,
		Deleted:  false,
		Status:   0,
	}, fileID)
	exportDataTaskID := idgen.NextId()

	go func() {
		retry := 3
		interval := config.GetSingleton().GetDefaultInterval().Fofa
		for index := int64(1); index <= page; index++ {
			req := NewGetDataReqBuilder().Query(queryLog.Query).
				Page(index).
				Size(pageSize).
				Fields(queryLog.Fields).
				Full(queryLog.Full).
				Build()
			result, err2 := r.fofa.Get(req)
			if err2 != nil {
				if retry == 0 {
					// retry为0可能是因为积分不足，所以不能直接返回错误，获取到多少数据就返回多少
					cacheItems, err := r.dataCache.GetByTaskID(exportDataTaskID)
					if err != nil {
						return
					}
					exportItems := make([]*fofa.Item, 0)
					for _, cacheItem := range cacheItems {
						exportItems = append(exportItems, cacheItem.Item)
					}
					if err := r.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
						return
					}
					break
				}
				index--
				retry--
				time.Sleep(time.Duration(interval) * time.Millisecond)
				continue
			}
			_ = r.dataCache.BatchInsert(exportDataTaskID, result.Items)
			time.Sleep(time.Duration(interval) * time.Millisecond)
		}

		cacheItems, err := r.dataCache.GetByTaskID(exportDataTaskID)
		if err != nil {
			return
		}
		exportItems := make([]*fofa.Item, 0)
		for _, cacheItem := range cacheItems {
			exportItems = append(exportItems, cacheItem.Item)
		}
		if err := r.fofa.Export(exportItems, outputAbsFilepath, queryLog.Fields); err != nil {
			return
		}
		event.HasNewDownloadLogItemEventEmit(event.GetSingleton().HasNewFofaDownloadItem)
	}()
	return nil
}

func (r *Bridge) GetUserInfo() (*User, error) {
	user, err := r.fofa.User()
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Bridge) SetAuth(email, key string) error {
	if err := config.GetSingleton().SaveFofaAuth(email, key); err != nil {
		return err

	}
	r.fofa.SetAuth(email, key)
	return nil
}
