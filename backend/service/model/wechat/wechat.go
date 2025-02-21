package wechat

type Version struct {
	Number     string
	UpdateDate string
}

type MiniProgram struct {
	AppID      string
	UpdateDate string
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
	*MiniProgram
	Info     Info
	Status   int
	Versions []*VersionStatus
}
type VersionStatus struct {
	Number          string
	DecompileStatus int
	MatchStatus     int
}
