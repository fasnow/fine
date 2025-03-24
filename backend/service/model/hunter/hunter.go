package hunter

type User struct {
	AccountType string
	RestQuota   int
}

type Component struct {
	Name    string `json:"name"`    //组件名称
	Version string `json:"version"` //组件版本
	ItemID  int64
}

type Item struct {
	IsRisk         string       `json:"is_risk"`          //风险资产
	URL            string       `json:"url"`              //url
	IP             string       `json:"ip"`               //IP
	Port           int          `json:"port"`             //端口
	WebTitle       string       `json:"web_title"`        //网站标题
	Domain         string       `json:"domain"`           //域名
	IsRiskProtocol string       `json:"is_risk_protocol"` //高危协议
	Protocol       string       `json:"protocol"`         //协议
	BaseProtocol   string       `json:"base_protocol"`    //通讯协议
	StatusCode     int          `json:"status_code"`      //网站状态码
	Component      []*Component `json:"component" gorm:"foreignKey:ItemID"`
	Os             string       `json:"os"`                 //操作系统
	Company        string       `json:"company"`            //备案单位
	Number         string       `json:"number"`             //备案号
	Country        string       `json:"country,omitempty"`  ////这三个字段
	Province       string       `json:"province,omitempty"` ////合并保留一个
	City           string       `json:"city"`               ////city字段即可
	UpdatedAt      string       `json:"updated_at"`         //探查时间
	IsWeb          string       `json:"is_web"`             //web资产
	AsOrg          string       `json:"as_org"`             //注册机构
	Isp            string       `json:"isp"`                //运营商信息
	Banner         string       `json:"banner"`
}

// TableName 自定义表名
func (Component) TableName() string {
	return "hunter_component"
}
