package icp

type Image struct {
	BigImage   string `json:"bigImage"`
	SmallImage string `json:"smallImage"`
	UUID       string `json:"uuid"`
	SecretKey  string `json:"secretKey"`
	WordCount  int    `json:"wordCount"`
}

type Item struct {
	ServiceName      string `json:"serviceName"`
	LeaderName       string `json:"leaderName"`
	NatureName       string `json:"natureName"`
	ServiceLicence   string `json:"serviceLicence"`
	UnitName         string `json:"unitName"`
	UpdateRecordTime string `json:"updateRecordTime"`
	ServiceType      string `json:"serviceType"`
}
