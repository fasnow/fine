package zone

import (
	"archive/zip"
	"fine/backend/logger"
	"fine/backend/service/model/zone"
	"fine/backend/utils"
	"fmt"
	"github.com/goccy/go-json"
	"io"
	"os"
	"strings"
)

type SiteResult struct {
	zone.QueryResultTotal
	Items []zone.SiteItem `json:"items"`
}

func (s *site) Get(req *GetDataReq) (*SiteResult, error) {
	req.req.Body.ZoneKeyId = s.client.key
	req.req.Body.QueryType = zone.SiteType
	page, size, total, dataList, err := s.client.analyze(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	var result SiteResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var siteDataItems []zone.SiteItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &siteDataItems)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
	}
	if siteDataItems == nil {
		siteDataItems = make([]zone.SiteItem, 0)
	}
	result.Items = siteDataItems
	for i := 0; i < len(result.Items); i++ {
		item := &result.Items[i]
		(*item).City = strings.TrimSpace(strings.Join([]string{(*item).Continent, (*item).Country, (*item).Province, (*item).City}, " "))
	}
	return &result, nil
}

type DomainResult struct {
	zone.QueryResultTotal
	Items []zone.DomainItem `json:"items"`
}

func (d *domain) Get(req *GetDataReq) (*DomainResult, error) {
	req.req.Body.ZoneKeyId = d.client.key
	req.req.Body.QueryType = zone.DomainType
	page, size, total, dataList, err := d.client.analyze(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	var result DomainResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var tempDomainStructList []struct {
		Msg struct {
			IP string `json:"ip"`
		} `json:"msg"`
		Icp     string `json:"icp"`
		Company any    `json:"company"` //公司名称 有可能是[]string或者string
		URL     string `json:"url"`     //子域名
	}
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &tempDomainStructList)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
	}

	//将Company字段全部转为string类型
	for i := 0; i < len(tempDomainStructList); i++ {
		if v, ok := tempDomainStructList[i].Company.([]string); ok && len(v) > 0 {
			tempDomainStructList[i].Company = v[0]
		} else if v, ok := tempDomainStructList[i].Company.(string); ok {
			tempDomainStructList[i].Company = v
		} else {
			tempDomainStructList[i].Company = ""
		}
	}

	//将结构体中已知any类型转为string类型
	var domainDataItems []zone.DomainItem
	for i := 0; i < len(tempDomainStructList); i++ {
		var tmp zone.DomainItem
		tmp.IP = tempDomainStructList[i].Msg.IP
		if v, ok := tempDomainStructList[i].Company.(string); ok {
			tmp.Company = v
		}
		tmp.Icp = tempDomainStructList[i].Icp
		tmp.URL = tempDomainStructList[i].URL
		domainDataItems = append(domainDataItems, tmp)
	}
	marshal, err := json.Marshal(tempDomainStructList)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	err = json.Unmarshal(marshal, &domainDataItems)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	if domainDataItems == nil {
		domainDataItems = make([]zone.DomainItem, 0)
	}
	result.Items = domainDataItems
	return &result, nil
}

type MemberResult struct {
	zone.QueryResultTotal
	Items []zone.MemberItem `json:"items"`
}

func (m *member) Get(req *GetDataReq) (*MemberResult, error) {
	req.req.Body.ZoneKeyId = m.client.key
	req.req.Body.QueryType = zone.MemberType
	page, size, total, dataList, err := m.client.analyze(req)
	if err != nil {
		logger.Info(err.Error())
		return nil, err
	}
	var result MemberResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var tempMemberStructList []struct {
		Name string `json:"name"`
		Msg  struct {
			Position     []string `json:"position"`
			Introduction []string `json:"introduction"`
		} `json:"msg"`
		Source    string `json:"source"`
		Timestamp string `json:"timestamp"`
		Company   any    `json:"company"`
	}
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &tempMemberStructList)
		if err != nil {
			logger.Info(err.Error())
			return nil, err
		}
	}
	var memberDataItems []zone.MemberItem
	for i := 0; i < len(tempMemberStructList); i++ {
		var tmp zone.MemberItem
		var company = tempMemberStructList[i].Company
		if value, ok := company.(string); ok {
			tmp.Company = value
		} else if value2, ok2 := company.([]string); ok2 && len(value2) > 0 {
			tmp.Company = value2[0]
		}
		tmp.Source = tempMemberStructList[i].Source
		tmp.Name = tempMemberStructList[i].Name
		tmp.Timestamp = tempMemberStructList[i].Timestamp
		tmp.Position = tempMemberStructList[i].Msg.Position
		if len(tempMemberStructList[i].Msg.Introduction) > 0 {
			tmp.Introduction = tempMemberStructList[i].Msg.Introduction[0]
		}
		memberDataItems = append(memberDataItems, tmp)
	}
	if memberDataItems == nil {
		memberDataItems = make([]zone.MemberItem, 0)
	}
	result.Items = memberDataItems
	return &result, nil
}

type EmailResult struct {
	zone.QueryResultTotal
	Items []zone.EmailItem `json:"items"`
}

func (e *email) Get(req *GetDataReq) (*EmailResult, error) {
	req.req.Body.ZoneKeyId = e.client.key
	req.req.Body.QueryType = zone.EmailType
	page, size, total, dataList, err := e.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result EmailResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	type tempEmailStruct struct {
		Email     string `json:"email"`
		EmailType string `json:"email_type"`
		Group     string `json:"group"`     //所属集团
		Source    any    `json:"source"`    //来源 有可能是string类型,需要转为[]string类型
		Timestamp string `json:"timestamp"` //更新时间
	}
	var tStructList []tempEmailStruct
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &tStructList)
		if err != nil {
			return nil, err
		}
	}
	//将Source字段全部转为[]string类型
	for i := 0; i < len(tStructList); i++ {
		if v, ok := tStructList[i].Source.([]string); ok && len(v) > 0 {
			tStructList[i].Source = v
		} else if v, ok := tStructList[i].Source.(string); ok {
			tStructList[i].Source = []string{v}
		} else {
			tStructList[i].Source = []string{}
		}
	}
	var emailDataItems []zone.EmailItem
	marshal, err := json.Marshal(tStructList)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(marshal, &emailDataItems)
	if err != nil {
		return nil, err
	}
	if emailDataItems == nil {
		emailDataItems = make([]zone.EmailItem, 0)
	}
	result.Items = emailDataItems
	return &result, nil
}

type ApkResult struct {
	zone.QueryResultTotal
	Items []zone.ApkItem `json:"items"`
}

func (a *apk) Get(req *GetDataReq) (*ApkResult, error) {
	req.req.Body.ZoneKeyId = a.client.key
	req.req.Body.QueryType = zone.ApkType
	page, size, total, dataList, err := a.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result ApkResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var apkDataItems []zone.ApkItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &apkDataItems)
		if err != nil {
			return nil, err
		}
	}
	//msg字段分为三种不同的类型只返回我们想要的数据字段，并且统一格式
	// 微信公众号 微信公众号(含小程序)
	type msgOfWechat struct {
		IconURL      string `json:"iconUrl"`      //logo
		Code         string `json:"code"`         //公众号二维码
		Introduction string `json:"introduction"` //描述/说明
		MiniProgram  []struct {
			AppId         string `json:"appid"`
			CertifiedText string `json:"certified_text"` //账号主体
			Desc          string `json:"desc"`           //描述
			HeadimgUrl    string `json:"headimg_url"`    //favicon
			Nickname      string `json:"nickname"`       //别名
		} `json:"mini_program"`
		WechatID string `json:"wechat_id"` //微信公众号id
	}
	for i := 0; i < len(apkDataItems); i++ {
		switch apkDataItems[i].Type {
		case zone.Wechat1, zone.Wechat2:
			var mOfWechat msgOfWechat
			marshal, err := json.Marshal(apkDataItems[i].Msg)
			if err != nil {
				return nil, err
			}
			err = json.Unmarshal(marshal, &mOfWechat)
			if err != nil {
				return nil, err
			}
			if len(mOfWechat.MiniProgram) == 0 || mOfWechat.MiniProgram[0].AppId == "" {
				mOfWechat.MiniProgram = mOfWechat.MiniProgram[:0]
			}
			apkDataItems[i].Msg = mOfWechat
			break
		case zone.MiniProgram:
			// 微信小程序
			type msgOfMiniProgram struct {
				IconURL      string `json:"iconUrl"`      //logo
				Code         string `json:"code"`         //公众号二维码
				Introduction string `json:"introduction"` //描述/说明
				AppId        string `json:"app_id"`       //微信公众号id
			}

			var mOfMiniProgram msgOfMiniProgram
			marshal, err := json.Marshal(apkDataItems[i].Msg)
			if err != nil {
				return nil, err
			}
			err = json.Unmarshal(marshal, &mOfMiniProgram)
			if err != nil {
				return nil, err
			}
			apkDataItems[i].Msg = mOfMiniProgram
			break
		case zone.AndroidApk:
			// 安卓apk
			type msgOfApk struct {
				AppURL       string `json:"app_url"`
				IconURL      string `json:"iconUrl"`
				Introduction string `json:"introduction"`
			}

			var mOfApk msgOfApk
			marshal, err := json.Marshal(apkDataItems[i].Msg)
			if err != nil {
				return nil, err
			}
			err = json.Unmarshal(marshal, &mOfApk)
			if err != nil {
				return nil, err
			}
			apkDataItems[i].Msg = mOfApk
			break
		default:
			//要是有其他类型呢？
		}
	}
	if apkDataItems == nil {
		apkDataItems = make([]zone.ApkItem, 0)
	}
	result.Items = apkDataItems
	return &result, nil
}

type CodeResult struct {
	zone.QueryResultTotal
	Items []zone.CodeItem `json:"items"`
}

func (c *code) Get(req *GetDataReq) (*CodeResult, error) {
	req.req.Body.ZoneKeyId = c.client.key
	req.req.Body.QueryType = zone.CodeType
	page, size, total, dataList, err := c.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result CodeResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var codeDataItem []zone.CodeItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &codeDataItem)
		if err != nil {
			return nil, err
		}
		for i := 0; i < len(codeDataItem); i++ {
			if codeDataItem[i].Keyword == nil {
				codeDataItem[i].Keyword = []string{}
			} else if value, ok := codeDataItem[i].Keyword.(string); ok {
				codeDataItem[i].Keyword = []string{value}
			}
		}
	}

	result.Items = codeDataItem
	return &result, nil
}

type DarknetResult struct {
	zone.QueryResultTotal
	Items []zone.DarknetItem `json:"items"`
}

func (d *darknet) Get(req *GetDataReq) (*DarknetResult, error) {
	req.req.Body.ZoneKeyId = d.client.key
	req.req.Body.QueryType = zone.DarknetType
	page, size, total, dataList, err := d.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result DarknetResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var darknetDataItem []zone.DarknetItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &darknetDataItem)
		if err != nil {
			return nil, err
		}
		for i := 0; i < len(darknetDataItem); i++ {
			item := darknetDataItem[i]
			if value, ok := item.UserID.(string); ok {
				darknetDataItem[i].UserID = []string{value}
			}
			if value, ok := item.Timestamp.([]string); ok {
				if len(value) > 0 {
					darknetDataItem[i].Timestamp = value[0]
				} else {
					darknetDataItem[i].Timestamp = ""
				}
			}
		}
	}
	result.Items = darknetDataItem
	return &result, nil
}

type AimResult struct {
	zone.QueryResultTotal
	Items []zone.AimItem `json:"items"`
}

func (a *aim) Get(req *GetDataReq) (*AimResult, error) {
	req.req.Body.ZoneKeyId = a.client.key
	req.req.Body.QueryType = zone.AIMType
	page, size, total, dataList, err := a.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result AimResult
	result.Total = total
	result.PageNum = page
	result.PageSize = size
	var aimDataItem []zone.AimItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &aimDataItem)
		if err != nil {
			return nil, err
		}
	}
	result.Items = aimDataItem
	return &result, nil
}

func SiteDataExport(items []*zone.SiteItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "IP", "端口", "域名", "标题",
		//"状态码",
		"CMS", "服务", "地理位置", "Operator", "Group", "备案", "是否CDN", "Banner", "HTMLBanner", "SSL证书"}
	var data = [][]any{headers}
	for i, item := range items {
		isCdn := "否"
		if item.IsCdn == 1 {
			isCdn = "是"
		}
		var tmpItem = []any{
			i + 1,
			item.IP,
			item.Port,
			item.URL,
			item.Title,
			//item.StatusCode,
			item.Cms,
			item.Service,
			item.City,
			item.Operator,
			item.Group,
			item.Beian,
			isCdn,
			item.Banner,
			item.HTMLBanner,
			item.SslCertificate}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}

func DomainDataExport(items []*zone.DomainItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "IP", "域名", "企业名称", "备案"}
	var data = [][]any{headers}
	for i, domainDataItem := range items {
		var tmpItem = []any{i + 1, domainDataItem.IP, domainDataItem.URL, domainDataItem.Company, domainDataItem.Icp}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}

func ApkDataExport(items []*zone.ApkItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "企业名称", "标题", "应用类型", "简介", "更新时间"}
	var data = [][]any{headers}
	for i, apkDataItem := range items {
		var tmpItem = []any{i + 1, apkDataItem.Company, apkDataItem.Title, apkDataItem.Type, apkDataItem.Msg, apkDataItem.Timestamp}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}

func MemberDataExport(items []*zone.MemberItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "企业名称", "姓名", "职位", "简介", "来源", "更新时间"}
	var data = [][]any{headers}
	for i, item := range items {
		var tmpItem = []any{
			i + 1,
			item.Company,
			item.Name,
			strings.Join(item.Position, "\n"),
			item.Introduction,
			item.Source,
			item.Timestamp,
		}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}

func EmailDataExport(items []*zone.EmailItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "邮箱", "类型", "企业名称", "来源", "更新时间"}
	var data = [][]any{headers}
	for i, item := range items {
		var tmpItem = []any{
			i + 1,
			item.Email,
			item.EmailType,
			item.Group,
			strings.Join(item.Source, "、"),
			item.Timestamp,
		}
		data = append(data, tmpItem)
	}
	if err := utils.SaveToExcel(data, filename); err != nil {
		return err
	}
	return nil
}

func CodeDataExport(items []*zone.CodeItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var files = make(map[string]string)
	for _, item := range items {
		var content = fmt.Sprintf("文件ID: %s\n", item.ID)
		content = fmt.Sprintf("文件名: %s\n", item.Name)
		content += fmt.Sprintf("风险指数: %d\n", item.Score)
		content += fmt.Sprintf("文件链接: %s\n", item.URL)
		//必然是字符串列表
		if value, ok := item.Keyword.([]string); ok {
			content += fmt.Sprintf("关键词: %s\n", strings.Join(value, ","))
		}
		if len(item.Tags) > 0 {
			content += fmt.Sprintf("标签: %s\n", strings.Join(item.Tags, ","))
		}
		content += fmt.Sprintf("来源: %s\n", item.Source)
		content += fmt.Sprintf("文件类型: %s\n", item.Type)
		content += fmt.Sprintf("收录时间: %s\n", item.Timestamp)

		var ownerInfo []string
		if item.Owner.ID != "" {
			ownerInfo = append(ownerInfo, fmt.Sprintf("用户ID:%s", item.Owner.ID))
		}
		if item.Owner.Login != "" {
			ownerInfo = append(ownerInfo, fmt.Sprintf("登录ID:%s", item.Owner.Login))
		}
		if item.Owner.URL != "" {
			ownerInfo = append(ownerInfo, fmt.Sprintf("主页:%s", item.Owner.URL))
		}
		if item.Owner.AvatarURL != "" {
			ownerInfo = append(ownerInfo, fmt.Sprintf("头像:%s", item.Owner.AvatarURL))
		}
		if len(ownerInfo) > 0 {
			content += fmt.Sprintf("作者信息: %s\n", strings.Join(ownerInfo, " "))
		}
		var projectInfo []string
		if item.Repository.ID != 0 {
			projectInfo = append(projectInfo, fmt.Sprintf("ID:%d", item.Repository.ID))
		}
		if item.Repository.Name != "" {
			projectInfo = append(projectInfo, fmt.Sprintf("名称:%s", item.Repository.Name))
		}

		if item.Repository.NodeID != "" {
			projectInfo = append(projectInfo, fmt.Sprintf("节点ID:%s", item.Repository.NodeID))
		}
		if item.Repository.Fork {
			projectInfo = append(projectInfo, "克隆:是")
		} else {
			projectInfo = append(projectInfo, "克隆:否")
		}
		if item.Repository.Private {
			projectInfo = append(projectInfo, "私有:是")
		} else {
			projectInfo = append(projectInfo, "私有:否")
		}
		if item.Repository.URL != "" {
			projectInfo = append(projectInfo, fmt.Sprintf("链接:%s", item.Repository.URL))
		}
		if item.Repository.Description != "" {
			projectInfo = append(projectInfo, fmt.Sprintf("描述:%s", item.Repository.Description))
		}
		if len(projectInfo) > 0 {
			content += fmt.Sprintf("项目信息: %s\n", strings.Join(projectInfo, " "))
		}
		if len(item.DetailParsing.PhoneList) > 0 {
			content += fmt.Sprintf("涉及手机号码: %s\n", strings.Join(item.DetailParsing.PhoneList, "、"))
		}
		if len(item.DetailParsing.TelegramList) > 0 {
			content += fmt.Sprintf("涉及telegram: %s\n", strings.Join(item.DetailParsing.TelegramList, "、"))
		}
		if len(item.DetailParsing.EmailList) > 0 {
			content += fmt.Sprintf("涉及邮箱: %s\n", strings.Join(item.DetailParsing.EmailList, "、"))
		}
		if len(item.DetailParsing.DomainList) > 0 {
			content += fmt.Sprintf("涉及域名: %s\n", strings.Join(item.DetailParsing.DomainList, "、"))
		}
		if len(item.DetailParsing.IPList) > 0 {
			content += fmt.Sprintf("涉及IP: %s\n", strings.Join(item.DetailParsing.IPList, "、"))
		}
		if len(item.DetailParsing.WangpanList) > 0 {
			content += fmt.Sprintf("涉及网盘: %s\n", strings.Join(item.DetailParsing.WangpanList, "、"))
		}
		if len(item.RelatedCompany) > 0 {
			content += fmt.Sprintf("涉及企业: %s\n", strings.Join(item.RelatedCompany, "、"))
		}
		content += fmt.Sprintf("代码详情:\n\n%s\n", item.CodeDetail)
		var tmpFilename1, _ = strings.CutSuffix(item.Name, "."+item.FileExtension)
		var tmpFilename2 = tmpFilename1 + ".txt"
		for i := 1; ; i++ {
			if files[tmpFilename2] != "" {
				tmpFilename2 = fmt.Sprintf("%s (%d).txt", tmpFilename1, i)
			} else {
				break
			}
		}
		files[tmpFilename2] = content
	}
	// 创建临时文件来存储ZIP内容
	tempFile, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer tempFile.Close()

	// 创建一个ZIP写入器
	zipWriter := zip.NewWriter(tempFile)
	defer zipWriter.Close()

	for name, content := range files {
		// 在ZIP中创建一个文本文件
		textFileWriter, err := zipWriter.Create(name)
		if err != nil {
			return err
		}
		_, err = io.WriteString(textFileWriter, content)
		if err != nil {
			return err
		}
	}
	return nil
}

func DarknetDataExport(items []*zone.DarknetItem, filename string) error {
	//if len(items) == 0 {
	//	return nil
	//}
	//var headers = []any{"ID", "页面MD5", "类型", "企业名称", "来源", "更新时间"}
	////var data = [][]any{headers}
	////for i, item := range items {
	////
	////}
	return nil
}

func AimDataExport(items []*zone.AimItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	//if err := utils.SaveToExcel(data, filename); err != nil {
	//	return err
	//}
	return nil
}
