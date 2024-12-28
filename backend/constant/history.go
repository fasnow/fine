package constant

type HistoryType = int

type History struct {
	FOFA   HistoryType `json:"fofa"`
	Hunter HistoryType `json:"hunter"`
	Quake  HistoryType `json:"quake"`
	Zone   HistoryType `json:"zone"`
	ICP    HistoryType `json:"icp"`
	TYC    HistoryType `json:"tyc"`
}

var Histories = &History{
	FOFA:   0,
	Hunter: 1,
	Quake:  2,
	Zone:   3,
	ICP:    4,
	TYC:    5,
}
