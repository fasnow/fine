package icp

type Image struct {
	BigImage   string `json:"bigImage"`
	SmallImage string `json:"smallImage"`
	UUID       string `json:"uuid"`
	SecretKey  string `json:"secretKey"`
	WordCount  int    `json:"wordCount"`
}
type Item struct {
	//ContentTypeName  string `json:"contentTypeName"`
	Domain           string `json:"domain"`
	DomainID         int    `json:"domainId"`
	LeaderName       string `json:"leaderName"`
	LimitAccess      string `json:"limitAccess"`
	MainID           int    `json:"mainId"`
	MainLicence      string `json:"mainLicence"`
	NatureName       string `json:"natureName"`
	ServiceID        int    `json:"serviceId"`
	ServiceLicence   string `json:"serviceLicence"`
	UnitName         string `json:"unitName"`
	UpdateRecordTime string `json:"updateRecordTime"`
}
