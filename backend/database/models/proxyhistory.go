package models

import "fine/backend/config"

type ProxyHistory struct {
	BaseModel
	config.Proxy
}
