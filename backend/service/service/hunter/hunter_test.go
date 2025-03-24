package hunter

import (
	"encoding/json"
	"fine/backend/application"
	"testing"
)

func TestNewClient(t *testing.T) {
	client := NewClient(application.DefaultApp.Config.Hunter.Token)
	req := NewQueryReqBuilder().Size(10).Page(1).Query("domain=asdf").Build()
	result, err := client.Query(req)
	if err != nil {
		t.Error(err)
		return
	}
	bytes, err := json.Marshal(result.Items)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(string(bytes))
}
