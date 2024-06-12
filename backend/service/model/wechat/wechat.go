package wechat

import "gorm.io/gorm"

type Version struct {
	gorm.Model
	VersionID  int64
	Number     string `json:"number"`
	Unpacked   bool   `json:"unpacked"`
	UpdateDate string `json:"update_date"`
}

type MiniProgram struct {
	AppID      string    `json:"appid"`
	UpdateDate string    `json:"update_date"`
	Versions   []Version `gorm:"foreignKey:VersionID" json:"versions"`
}

type Info struct {
	Nickname      string `json:"nickname"`
	Username      string `json:"username"`
	Description   string `json:"description"`
	Avatar        string `json:"avatar"`
	UsesCount     string `json:"uses_count"`
	PrincipalName string `json:"principal_name"`
	AppID         string `json:"appid"`
}

type InfoToFront struct {
	MiniProgram
	Nickname      string `json:"nickname"`
	Username      string `json:"username"`
	Description   string `json:"description"`
	Avatar        string `json:"avatar"`
	UsesCount     string `json:"uses_count"`
	PrincipalName string `json:"principal_name"`
}
