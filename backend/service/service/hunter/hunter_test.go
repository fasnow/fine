package hunter

import (
	"encoding/json"
	"testing"
)

func TestNewClient(t *testing.T) {
	client := NewClient("")
	req := NewGetDataReqBuilder().Size(10).Page(1).Query("domain=asdf").Build()
	result, err := client.Get(req)
	if err != nil {
		return
	}
	bytes, err := json.Marshal(result.Items)
	if err != nil {
		return
	}
	t.Log(string(bytes))
}
