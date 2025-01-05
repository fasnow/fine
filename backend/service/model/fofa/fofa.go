package fofa

type Item struct {
	Ip              string `json:"ip"`               //ip	    		ip地址				权限：无
	Port            string `json:"port"`             //port				端口					权限：无
	Protocol        string `json:"protocol"`         //protocol			协议名				权限：无
	Country         string `json:"country"`          //country			国家代码				权限：无
	CountryName     string `json:"country_name"`     //country_name		国家名				权限：无
	Region          string `json:"region"`           //region			区域					权限：无
	City            string `json:"city"`             //city				城市					权限：无
	Longitude       string `json:"longitude"`        //longitude		地理位置 经度			权限：无
	Latitude        string `json:"latitude"`         //latitude			地理位置 纬度			权限：无
	AsNumber        string `json:"as_number"`        //as_number		asn编号				权限：无
	AsOrganization  string `json:"as_organization"`  //as_organization	asn组织				权限：无
	Host            string `json:"host"`             //host				主机名				权限：无
	Domain          string `json:"domain"`           //domain			域名					权限：无
	Os              string `json:"os"`               //os			    操作系统				权限：无
	Server          string `json:"server"`           //server			网站server			权限：无
	Icp             string `json:"icp"`              //icp				icp备案号			权限：无
	Title           string `json:"title"`            //title			网站标题				权限：无
	Jarm            string `json:"jarm"`             //jarm				jarm 指纹			权限：无
	Header          string `json:"header"`           //header			网站header			权限：无
	Banner          string `json:"banner"`           //banner			协议 banner			权限：无
	Cert            string `json:"cert"`             //cert				证书					权限：无
	BaseProtocol    string `json:"base_protocol"`    //base_protocol	基础协议，比如tcp/udp	权限：无
	Link            string `json:"link"`             //link				资产的URL链接			权限：无
	Product         string `json:"product"`          //product			产品名				权限：专业版本及以上
	ProductCategory string `json:"product_category"` //product_category 产品分类			    权限：专业版本及以上
	Version         string `json:"version"`          //version			版本号				权限：专业版本及以上
	LastUpdateTime  string `json:"lastupdatetime"`   //lastupdatetime	FOFA最后更新时间	    权限：专业版本及以上
	Cname           string `json:"cname"`            //cname			域名cname			权限：专业版本及以上
	IconHash        string `json:"icon_hash"`        //icon_hash		返回的icon_hash值	权限：商业版本及以上
	CertsValid      string `json:"certs_valid"`      //certs_valid		证书是否有效			权限：商业版本及以上
	CnameDomain     string `json:"cname_domain"`     //cname_domain		cname的域名			权限：商业版本及以上
	Body            string `json:"body"`             //body				网站正文内容			权限：商业版本及以上
	Icon            string `json:"icon"`             //icon				icon 图标			权限：企业会员
	Fid             string `json:"fid"`              //fid	     		fid					权限：企业会员
	Structinfo      string `json:"structinfo"`       //structinfo		结构化信息 (部分协议支持、比如elastic、mongodb)	权限：企业会员
}

type Detail struct {
	Count int    `json:"count"`
	Name  string `json:"name"`
}
type Country struct {
	Code     string    `json:"code"`
	Count    int       `json:"count"`
	Name     string    `json:"name"`
	NameCode string    `json:"name_code"`
	Regions  []Regions `json:"regions"`
}

type Regions struct {
	Code  string `json:"code"`
	Count int    `json:"count"`
	Name  string `json:"name"`
}
type Product struct {
	Product      string `json:"product"`
	Category     string `json:"category"`
	Level        int    `json:"level"`
	SortHardCode int    `json:"sort_hard_code"`
	Company      string `json:"company"`
}

type Port struct {
	Port       int       `json:"port"`
	UpdateTime string    `json:"update_time"`
	Protocol   string    `json:"protocol"`
	Products   []Product `json:"products"`
}

type Aggs struct {
	AsNumber       []Detail  `json:"as_number"`
	AsOrganization []Detail  `json:"as_organization"`
	AssetType      []Detail  `json:"asset_type"`
	Countries      []Country `json:"countries"`
	Domain         []Detail  `json:"domain"`
	Fid            []Detail  `json:"fid"`
	Icp            []Detail  `json:"icp"`
	Os             []Detail  `json:"os"`
	Port           []Detail  `json:"port"`
	Protocol       []Detail  `json:"protocol"`
	Server         []Detail  `json:"server"`
	Title          []Detail  `json:"title"`
}
