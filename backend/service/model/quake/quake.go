package quake

import (
	"database/sql/driver"
	"encoding/json"
	"fine/backend/constant"
	"time"
)

type RealtimeServiceItem struct {
	Components []Component `json:"components" gorm:"foreignKey:ItemID"`
	Org        string      `json:"org"` //自治域
	IP         string      `json:"ip"`
	OsVersion  string      `json:"os_version"`
	IsIpv6     bool        `json:"is_ipv6"`
	Transport  string      `json:"transport"`
	Hostname   string      `json:"hostname"`
	Port       int         `json:"port"`
	Service    Service     `json:"service" gorm:"foreignKey:ItemID"`
	Domain     string      `json:"domain"`
	OsName     string      `json:"os_name"`
	Location   Location    `json:"location"`
	Time       string      `json:"time"`
	Asn        int         `json:"asn"` //自治域编号
}

type RealtimeHostItem struct {
	Components []struct {
		ProductLevel   string   `json:"product_level"`
		ProductType    []string `json:"product_type"`
		ProductVendor  string   `json:"product_vendor"`
		ProductNameCn  string   `json:"product_name_cn"`
		ProductNameEn  string   `json:"product_name_en"`
		ID             string   `json:"id"`
		Version        string   `json:"version"`
		ProductCatalog []string `json:"product_catalog"`
	} `json:"components"`
	Org       string `json:"org"` //自治域
	IP        string `json:"ip"`
	OsVersion string `json:"os_version"`
	IsIpv6    bool   `json:"is_ipv6"`
	Transport string `json:"transport"`
	Hostname  string `json:"hostname"`
	Port      int    `json:"port"`
	Service   struct {
		Response string `json:"response"`
		TLSJarm  struct {
			JarmHash string   `json:"jarm_hash"`
			JarmAns  []string `json:"jarm_ans"`
		} `json:"tls-jarm"`
		ResponseHash string `json:"response_hash"`
		Name         string `json:"name"`
		HTTP         struct {
			Server     string `json:"server"`
			StatusCode int    `json:"status_code"`
			Title      string `json:"title"`
			Host       string `json:"host"`
			Path       string `json:"path"`
		} `json:"http"`
		Cert string `json:"cert"`
	} `json:"service"`
	Domain   string `json:"domain"`
	OsName   string `json:"os_name"`
	Location struct {
		Owner       string    `json:"owner"`
		ProvinceCn  string    `json:"province_cn"`
		ProvinceEn  string    `json:"province_en"`
		Isp         string    `json:"isp"` //运营商
		CountryEn   string    `json:"country_en"`
		DistrictCn  string    `json:"district_cn"`
		Gps         []float64 `json:"gps"`
		StreetCn    string    `json:"street_cn"`
		CityEn      string    `json:"city_en"`
		DistrictEn  string    `json:"district_en"`
		CountryCn   string    `json:"country_cn"`
		StreetEn    string    `json:"street_en"`
		CityCn      string    `json:"city_cn"`
		CountryCode string    `json:"country_code"`
		Asname      string    `json:"asname"`
		SceneCn     string    `json:"scene_cn"`
		SceneEn     string    `json:"scene_en"`
		Radius      float64   `json:"radius"`
	} `json:"location"`
	Time time.Time `json:"time"`
	Asn  int       `json:"asn"` //自治域编号
}

type Component struct {
	SID            int64 `gorm:"primarykey"`
	ItemID         int64
	ProductLevel   string               `json:"product_level"`
	ProductType    constant.StringArray `json:"product_type"`
	ProductVendor  string               `json:"product_vendor"`
	ProductNameCn  string               `json:"product_name_cn"`
	ProductNameEn  string               `json:"product_name_en"`
	ID             string               `json:"id"`
	Version        string               `json:"version"`
	ProductCatalog constant.StringArray `json:"product_catalog"`
}

func (Component) TableName() string {
	return "quake_component"
}

//func (u *Component) Scan(value interface{}) error {
//	bytesValue, _ := value.([]uint8)
//	return json.Unmarshal(bytesValue, u)
//}
//
//func (u Component) Value() (driver.Value, error) {
//	marshal, err := json.Marshal(u)
//	if err != nil {
//		return nil, err
//	}
//	return string(marshal), nil
//}

type Service struct {
	ItemID   int64
	Response string `json:"response"`
	//TLSJarm  struct { //该字段为string或者struct
	//	JarmHash string   `json:"jarm_hash"`
	//	JarmAns  []string `json:"jarm_ans"`
	//} `json:"tls-jarm"`
	ResponseHash string `json:"response_hash"`
	Name         string `json:"name"`
	HTTP         HTTP   `json:"http"`
	Cert         string `json:"cert"`
}

type HTTP struct {
	Server     string `json:"server"`
	StatusCode any    `json:"status_code"` //200 or 暂无权限
	Title      string `json:"title"`
	Host       string `json:"host"`
	Path       string `json:"path"`
}

func (Service) TableName() string {
	return "quake_service"
}

func (r *HTTP) Scan(value interface{}) error {
	bytesValue, _ := value.([]byte)
	return json.Unmarshal(bytesValue, r)
}

func (r HTTP) Value() (driver.Value, error) {
	marshal, err := json.Marshal(r)
	if err != nil {
		return nil, err
	}
	return marshal, nil
}

type Location struct {
	LocationID  int64
	Owner       string                `json:"owner"`
	ProvinceCn  string                `json:"province_cn"`
	ProvinceEn  string                `json:"province_en"`
	Isp         string                `json:"isp"` //运营商
	CountryEn   string                `json:"country_en"`
	DistrictCn  string                `json:"district_cn"`
	Gps         constant.Float64Array `json:"gps"`
	StreetCn    string                `json:"street_cn"`
	CityEn      string                `json:"city_en"`
	DistrictEn  string                `json:"district_en"`
	CountryCn   string                `json:"country_cn"`
	StreetEn    string                `json:"street_en"`
	CityCn      string                `json:"city_cn"`
	CountryCode string                `json:"country_code"`
	Asname      string                `json:"asname"`
	SceneCn     string                `json:"scene_cn"`
	SceneEn     string                `json:"scene_en"`
	Radius      float64               `json:"radius"`
}

func (r *Location) Scan(value interface{}) error {
	bytesValue, _ := value.([]byte)
	return json.Unmarshal(bytesValue, &r)
}

func (r Location) Value() (driver.Value, error) {
	marshal, err := json.Marshal(&r)
	if err != nil {
		return nil, err
	}
	return marshal, nil
}

type DsdqResult struct{}

type DsdqResultItem struct{}

type DhdqResult struct{}

type DhdqResultItem struct{}
