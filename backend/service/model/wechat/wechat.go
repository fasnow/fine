package wechat

type Version struct {
	Number     string
	UpdateDate string
}

type MiniAppBaseInfo struct {
	AppID      string
	UpdateDate string
}

type MiniProgram struct {
	*MiniAppBaseInfo
	Versions []*Version
}

type Info struct {
	Nickname      string
	Username      string
	Description   string
	Avatar        string
	UsesCount     string
	PrincipalName string
	AppID         string
}

type InfoToFront struct {
	*MiniAppBaseInfo
	Info     *Info
	Status   int
	Versions []*VersionTaskStatus
}
type VersionTaskStatus struct {
	Number          string
	DecompileStatus int
	MatchStatus     int
	Message         string
}
