package constant

type Status struct {
	InProgress int `json:"exporting"`
	Completed  int `json:"completed"`
	Deleted    int `json:"deleted"`
	Error      int `json:"error"`
	OK         int `json:"ok"`
}

var Statuses = &Status{
	InProgress: 1,
	Completed:  2,
	Deleted:    3,
	Error:      4,
	OK:         5,
}
