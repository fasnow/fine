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
	AppID      string    `json:"app_id"`
	UpdateDate string    `json:"update_date"`
	Versions   []Version `gorm:"foreignKey:VersionID" json:"versions"`
}
