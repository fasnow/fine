package shodan

import (
	"fine/backend/application"
	"testing"
)

func TestBridge_HostSearch(t *testing.T) {
	b := NewBridge(application.DefaultApp)
	hostSearch, err := b.HostSearch(0, "hostname:sqlsec.com", "", 1, false)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(hostSearch)
}
