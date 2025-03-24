package properties

// Shodan 结构体
type Shodan struct {
	Crawler string        `json:"crawler"` // 唯一爬虫 ID
	ID      string        `json:"id"`      // 唯一 banner ID
	Module  string        `json:"module"`  // 初始协议
	Options ShodanOptions `json:"options"` // 选项
	PTR     bool          `json:"ptr"`     // 是否有 PTR 记录
}

// ShodanOptions 结构体
type ShodanOptions struct {
	Hostname string `json:"hostname"` // 用于与服务通信的主机名
	Referrer string `json:"referrer"` // 触发当前 banner 的 banner ID
	Scan     string `json:"scan"`     // 唯一扫描 ID
}

type Location struct {
	City        string  `json:"city"`
	CountryCode string  `json:"country_code"`
	CountryName string  `json:"country_name"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	RegionCode  string  `json:"region_code"`
}
