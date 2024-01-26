package model

type DownloadLog struct {
	BaseModel
	Filename string `json:"filename"`
	Dir      string `json:"dir"`
	Deleted  bool   `json:"deleted"`
	FileID   int64  `json:"fileId"`
	Status   int    `json:"status"`  //-1:err 0:doing 1:done
	Message  string `json:"message"` //用于存储发生错误时的信息
}

func (DownloadLog) TableName() string {
	return "export_log"
}

type ExportStatus struct {
	FileID  int64
	Message string
}
