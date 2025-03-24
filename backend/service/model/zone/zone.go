package zone

import (
	"gorm.io/datatypes"
)

type QueryType string

type AppType string

const (
	SiteType    QueryType = "site"
	ApkType     QueryType = "apk"
	MemberType  QueryType = "member"
	EmailType   QueryType = "email"
	DomainType  QueryType = "domain"
	CodeType    QueryType = "code"
	DarknetType QueryType = "darknet"
	AIMType     QueryType = "telegram"
)

const (
	MiniProgram AppType = "微信小程序"
	Wechat1     AppType = "微信公众号"
	Wechat2     AppType = "微信公众号(含小程序)"
	AndroidApk  AppType = "安卓APK"
)

type SiteItem struct {
	IP    string `json:"ip"`
	Port  string `json:"port"`
	URL   string `json:"url"`
	Title string `json:"title"`
	//StatusCode     int `json:"status_code"`
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
	Type      AppType `json:"type"`      //应用类型 微信公众号 微信公众号(含小程序) 安卓apk
	Source    string  `json:"source"`    //数据来源
	Timestamp string  `json:"timestamp"` //入库时间
	Msg       any     `json:"msg"`       //应该是 msgOfWechat msgOfApk msgOfMiniProgramMsg中的一类
}

type MemberItem struct {
	Name         string                      `json:"name"`
	Position     datatypes.JSONSlice[string] `json:"position"`
	Introduction string                      `json:"introduction"`
	Source       string                      `json:"source"`    //来源
	Timestamp    string                      `json:"timestamp"` //入库时间
	Company      string                      `json:"company"`   //所属集团 实际是字符串或者字符串列表，这里只取第一个
}

type DomainItem struct {
	IP      string `json:"ip"`
	Icp     string `json:"icp"`
	Company string `json:"company"` //公司名称 有可能是[]string,取第一个转为string
	URL     string `json:"url"`     //子域名
}

type EmailItem struct {
	Email     string                      `json:"email"`
	EmailType string                      `json:"email_type"`
	Group     string                      `json:"group"`     //所属集团
	Source    datatypes.JSONSlice[string] `json:"source"`    //来源 有可能是string类型,需要转为[]string类型
	Timestamp string                      `json:"timestamp"` //更新时间
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
	PageNum  int   `json:"pageNum"`
	PageSize int   `json:"pageSize"`
	Total    int64 `json:"total"`
}
