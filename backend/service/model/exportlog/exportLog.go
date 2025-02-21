package exportlog

type Item struct {
	Filename string `json:"filename"`
	Dir      string `json:"dir"`
	ExportID int64  `json:"exportID"`
	Status   int    `json:"status"`
	Message  string `json:"message"`
	Error    string `json:"error"`
}
