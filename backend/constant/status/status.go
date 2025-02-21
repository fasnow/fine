package status

const (
	OK = iota
	Pending
	Running
	Paused
	Stopped
	Deleted
	Error
	Waiting
	ReRun
	Pausing
)

type StatusEnum struct {
	Pending int
	Running int
	Paused  int
	Stopped int
	Deleted int
	Error   int
	OK      int
	Waiting int
	ReRun   int
	Pausing int
}
