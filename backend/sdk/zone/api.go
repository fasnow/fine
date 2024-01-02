package zone

import (
	"archive/zip"
	"fine-server/utils"
	"fmt"
	"github.com/goccy/go-json"
	"io"
	"os"
	"strings"
)

type SiteItem struct {
	IP             string `json:"ip"`
	Port           string `json:"port"`
	URL            string `json:"url"`
	Title          string `json:"title"`
	StatusCode     string `json:"status_code"`
	Cms            string `json:"cms"`
	Continent      string `json:"continent,omitempty"` //这四个字段
	Country        string `json:"country,omitempty"`   //全部合并成
	Province       string `json:"province,omitempty"`  //一个city
	City           string `json:"city"`                //字段即可
	Operator       string `json:"operator"`
	Banner         string `json:"banner"`      //端口banner
	HTMLBanner     string `json:"html_banner"` //网页banner
	Group          string `json:"group"`
	Beian          string `json:"beian"`
	IsCdn          int    `json:"is_cdn"`
	SslCertificate string `json:"ssl_certificate"`
	Service        string `json:"service"`
}

type ApkItem struct {
	Title     string  `json:"title"`     //应用名称
	Company   string  `json:"company"`   //所属集团
	Type      apkType `json:"type"`      //应用类型 微信公众号 微信公众号(含小程序) 安卓apk
	Source    string  `json:"source"`    //数据来源
	Timestamp string  `json:"timestamp"` //入库时间
	Msg       any     `json:"msg"`       //应该是 msgOfWechat msgOfApk msgOfMiniProgramMsg中的一类
}

type MemberItem struct {
	Name         string   `json:"name"`
	Position     []string `json:"position"`
	Introduction string   `json:"introduction"`
	Source       string   `json:"source"`    //来源
	Timestamp    string   `json:"timestamp"` //入库时间
	Company      string   `json:"company"`   //所属集团 实际是字符串或者字符串列表，这里只取第一个
}

type DomainItem struct {
	IP      string `json:"ip"`
	Icp     string `json:"icp"`
	Company string `json:"company"` //公司名称 有可能是[]string,取第一个转为string
	URL     string `json:"url"`     //子域名
}

type EmailItem struct {
	Email     string   `json:"email"`
	EmailType string   `json:"email_type"`
	Group     string   `json:"group"`     //所属集团
	Source    []string `json:"source"`    //来源 有可能是string类型,需要转为[]string类型
	Timestamp string   `json:"timestamp"` //更新时间
	//Company   []string `json:"company"`   //所属集团
}

type CodeOwner struct {
	ID        string `json:"id"`
	Login     string `json:"login"`
	URL       string `json:"url"`
	AvatarURL string `json:"avatar_url"`
}

type Repository struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`        //项目名
	Description string `json:"description"` //readme文件
	NodeID      string `json:"node_id"`     //节点ID base64
	Fork        bool   `json:"fork"`
	Private     bool   `json:"private"`
	URL         string `json:"url"` //api查看链接 https://api.github.com/repos/username/repository
}

type DetailParsing struct {
	PhoneList    []string `json:"phone_list"`
	TelegramList []string `json:"telegram_list"`
	EmailList    []string `json:"email_list"`
	DomainList   []string `json:"domain_list"`
	IPList       []string `json:"ip_list"`
	WangpanList  []string `json:"wangpan_list"`
	Keyword      []string `json:"keyword"`
}

type CodeItem struct {
	ID              string        `json:"_id"`  //文件
	Name            string        `json:"name"` //文件名
	Path            string        `json:"path"`
	URL             string        `json:"url"` //文件链接
	Sha             string        `json:"sha"`
	Keyword         any           `json:"keyword"` //字符串或者字符串列表，返回结果统一处理为列表
	Tags            []string      `json:"tags"`
	FileExtension   string        `json:"file_extension"`
	Source          string        `json:"source"`      //来源
	CodeDetail      string        `json:"code_detail"` //代码详情
	Score           any           `json:"score"`       //风险指数
	Type            string        `json:"type"`        //type
	CreatedTime     string        `json:"created_time,omitempty"`
	Timestamp       string        `json:"timestamp"`
	Owner           CodeOwner     `json:"owner"`
	Repository      Repository    `json:"repository,omitempty"`
	DetailParsing   DetailParsing `json:"detail_parsing,omitempty"`
	TimestampUpdate string        `json:"timestamp_update,omitempty"`
	RelatedCompany  []string      `json:"related_company,omitempty"`
}

type DarknetMsg struct {
	NumSales    int      `json:"num_sales"`
	Quantity    string   `json:"quantity"`
	DailyTime   string   `json:"daily_time"`
	Author      string   `json:"author"`
	Price       string   `json:"price"`
	Daily       string   `json:"daily"`
	TitleCn     string   `json:"title_cn"`
	Description string   `json:"description"`
	Keyword     []string `json:"keyword"`
	ReleaseTime string   `json:"release_time"`
	Example     string   `json:"example"`
}

type Regions struct {
	Country  string `json:"country"`
	Province string `json:"province"`
	City     string `json:"city"`
}

type DarknetItem struct {
	ID            string        `json:"_id"`
	BodyMd5       string        `json:"body_md5"`
	Msg           DarknetMsg    `json:"msg"`
	StatusCode    int           `json:"status_code"`
	Regions       []Regions     `json:"regions"`
	Org           []string      `json:"org"`
	PageType      []string      `json:"page_type"`
	RootDomain    string        `json:"root_domain"`
	DetailParsing DetailParsing `json:"detail_parsing"`
	ToNew         string        `json:"to_new"`
	Description   string        `json:"description"`
	Industry      []string      `json:"industry"`
	Language      []string      `json:"language"`
	Source        string        `json:"source"`
	Title         string        `json:"title"`
	Hot           string        `json:"hot"`
	URL           string        `json:"url"`
	Tags          []string      `json:"tags"`
	Path          string        `json:"path"`
	UpdateTime    string        `json:"update_time"`
	ToplvDomain   string        `json:"toplv_domain"`
	UserID        any           `json:"user_id"` //string或者[]string,处理后设置为[]string类型
	Event         []string      `json:"event"`
	Timestamp     any           `json:"timestamp"` //string或者[]string,列表的化只取第一个，处理后设置为string类型
}
type AimSource struct {
	ChatID          string    `json:"chat_id"`
	ChatName        string    `json:"chat_name"`
	MessageID       string    `json:"message_id"`
	ContentText     string    `json:"content_text"`
	MessageTime     string    `json:"message_time"`
	MessageDate     string    `json:"message_date"`
	SenderFirstName string    `json:"sender_first_name"`
	SenderID        string    `json:"sender_id"`
	SenderLastName  string    `json:"sender_last_name"`
	SenderPhone     string    `json:"sender_phone"`
	SenderUsername  string    `json:"sender_username"`
	Tags            []string  `json:"tags"`
	Regions         []Regions `json:"regions"`
	Event           []string  `json:"event"`
	Org             []string  `json:"org"`
	Industry        []string  `json:"industry"`
	PageType        []string  `json:"page_type"`
	MediaFileURL    string    `json:"media_file_url"`
	MediaType       string    `json:"media_type"`
	FileExtension   string    `json:"file_extension"`
	Hot             int       `json:"hot"`
	ContentTextMd5  string    `json:"content_text_md5"`
}
type AimItem struct {
	Index   string    `json:"_index"`
	Type    string    `json:"_type"`
	ID      string    `json:"_id"`
	Score   any       `json:"_score"`
	Ignored []string  `json:"_ignored,omitempty"`
	Source  AimSource `json:"_source"`
	Sort    []int64   `json:"sort"`
}

type QueryOptions struct {
	Query     string
	Page      int
	Size      int
	TitleType QueryType
}

type QueryResultTotal struct {
	Page  int   `json:"page"`
	Size  int   `json:"pagesize"`
	Total int64 `json:"total"`
}

type SiteResult struct {
	QueryResultTotal
	Data []*SiteItem `json:"items"`
}

func (s *site) Get(req *GetDataReq) (*SiteResult, error) {
	req.req.Body.ZoneKeyId = s.client.key
	req.req.Body.QueryType = SiteType
	page, size, total, dataList, err := s.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result SiteResult
	result.Total = total
	result.Page = page
	result.Size = size
	var siteDataItems []*SiteItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &siteDataItems)
		if err != nil {
			return nil, err
		}
	}
	result.Data = siteDataItems
	for i := 0; i < len(result.Data); i++ {
		item := &result.Data[i]
		(*item).City = strings.TrimSpace(strings.Join([]string{(*item).Continent, (*item).Country, (*item).Province, (*item).City}, " "))
	}
	return &result, nil
}

type DomainResult struct {
	QueryResultTotal
	Data []*DomainItem `json:"items"`
}

func (d *domain) Get(req *GetDataReq) (*DomainResult, error) {
	req.req.Body.ZoneKeyId = d.client.key
	req.req.Body.QueryType = DomainType
	page, size, total, dataList, err := d.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result DomainResult
	result.Total = total
	result.Page = page
	result.Size = size
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
	var domainDataItems []*DomainItem
	for i := 0; i < len(tempDomainStructList); i++ {
		var tmp DomainItem
		tmp.IP = tempDomainStructList[i].Msg.IP
		if v, ok := tempDomainStructList[i].Company.(string); ok {
			tmp.Company = v
		}
		tmp.Icp = tempDomainStructList[i].Icp
		tmp.URL = tempDomainStructList[i].URL
		domainDataItems = append(domainDataItems, &tmp)
	}
	marshal, err := json.Marshal(tempDomainStructList)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(marshal, &domainDataItems)
	if err != nil {
		return nil, err
	}
	result.Data = domainDataItems
	return &result, nil
}

type MemberResult struct {
	QueryResultTotal
	Data []*MemberItem `json:"items"`
}

func (m *member) Get(req *GetDataReq) (*MemberResult, error) {
	req.req.Body.ZoneKeyId = m.client.key
	req.req.Body.QueryType = MemberType
	page, size, total, dataList, err := m.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result MemberResult
	result.Total = total
	result.Page = page
	result.Size = size
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
			return nil, err
		}
	}
	var memberDataItems []*MemberItem
	for i := 0; i < len(tempMemberStructList); i++ {
		var tmp MemberItem
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
		memberDataItems = append(memberDataItems, &tmp)
	}
	result.Data = memberDataItems
	return &result, nil
}

type EmailResult struct {
	QueryResultTotal
	Data []*EmailItem `json:"items"`
}

func (e *email) Get(req *GetDataReq) (*EmailResult, error) {
	req.req.Body.ZoneKeyId = e.client.key
	req.req.Body.QueryType = EmailType
	page, size, total, dataList, err := e.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result EmailResult
	result.Total = total
	result.Page = page
	result.Size = size
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
	var emailDataItems []*EmailItem
	marshal, err := json.Marshal(tStructList)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(marshal, &emailDataItems)
	if err != nil {
		return nil, err
	}
	result.Data = emailDataItems
	return &result, nil
}

type ApkResult struct {
	QueryResultTotal
	Data []*ApkItem `json:"items"`
}

func (a *apk) Get(req *GetDataReq) (*ApkResult, error) {
	req.req.Body.ZoneKeyId = a.client.key
	req.req.Body.QueryType = ApkType
	page, size, total, dataList, err := a.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result ApkResult
	result.Total = total
	result.Page = page
	result.Size = size
	var apkDataItems []*ApkItem
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
		case wechat1, wechat2:
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
		case miniProgram:
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
		case androidApk:
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
	result.Data = apkDataItems
	return &result, nil
}

type CodeResult struct {
	QueryResultTotal
	Data []*CodeItem `json:"items"`
}

func (c *code) Get(req *GetDataReq) (*CodeResult, error) {
	req.req.Body.ZoneKeyId = c.client.key
	req.req.Body.QueryType = CodeType
	page, size, total, dataList, err := c.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result CodeResult
	result.Total = total
	result.Page = page
	result.Size = size
	var codeDataItem []*CodeItem
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

	result.Data = codeDataItem
	return &result, nil
}

type DarknetResult struct {
	QueryResultTotal
	Data []*DarknetItem `json:"items"`
}

func (d *darknet) Get(req *GetDataReq) (*DarknetResult, error) {
	req.req.Body.ZoneKeyId = d.client.key
	req.req.Body.QueryType = DarknetType
	page, size, total, dataList, err := d.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result DarknetResult
	result.Total = total
	result.Page = page
	result.Size = size
	var darknetDataItem []*DarknetItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &darknetDataItem)
		if err != nil {
			return nil, err
		}
		for i := 0; i < len(darknetDataItem); i++ {
			item := darknetDataItem[i]
			if value, ok := (*item).UserID.(string); ok {
				(*item).UserID = []string{value}
			}
			if value, ok := (*item).Timestamp.([]string); ok {
				if len(value) > 0 {
					(*item).Timestamp = value[0]
				} else {
					(*item).Timestamp = ""
				}
			}
		}
	}
	result.Data = darknetDataItem
	return &result, nil
}

type AimResult struct {
	QueryResultTotal
	Data []*AimItem `json:"items"`
}

func (a *aim) Get(req *GetDataReq) (*AimResult, error) {
	req.req.Body.ZoneKeyId = a.client.key
	req.req.Body.QueryType = AIMType
	page, size, total, dataList, err := a.client.analyze(req)
	if err != nil {
		return nil, err
	}
	var result AimResult
	result.Total = total
	result.Page = page
	result.Size = size
	var aimDataItem []*AimItem
	if len(dataList) != 0 {
		err = json.Unmarshal(dataList, &aimDataItem)
		if err != nil {
			return nil, err
		}
	}
	result.Data = aimDataItem
	return &result, nil
}

func SiteDataExport(items []*SiteItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	var headers = []any{"ID", "IP", "端口", "域名", "标题", "状态码", "CMS", "服务", "地理位置", "Operator", "Group", "备案", "是否CDN", "Banner", "HTMLBanner", "SSL证书"}
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
			item.StatusCode,
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

func DomainDataExport(items []*DomainItem, filename string) error {
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

func ApkDataExport(items []*ApkItem, filename string) error {
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

func MemberDataExport(items []*MemberItem, filename string) error {
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

func EmailDataExport(items []*EmailItem, filename string) error {
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

func CodeDataExport(items []*CodeItem, filename string) error {
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

func DarknetDataExport(items []*DarknetItem, filename string) error {
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

func AimDataExport(items []*AimItem, filename string) error {
	if len(items) == 0 {
		return nil
	}
	//if err := utils.SaveToExcel(data, filename); err != nil {
	//	return err
	//}
	return nil
}
