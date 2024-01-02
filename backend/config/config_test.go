package config

import (
	"github.com/goccy/go-json"
	"testing"
)

func TestSaveToDownloadLog(t *testing.T) {
	err := AddDownloadLogItem("1.xlsx")
	if err != nil {
		t.Log(err)
		return
	}
	err = AddDownloadLogItem("2.xlsx")
	if err != nil {
		t.Log(err)
		return
	}
}

func TestGetDownloadLog(t *testing.T) {
	items, err := GetDownloadLog()
	if err != nil {
		t.Log(err)
		return
	}
	marshal, err := json.Marshal(items)
	if err != nil {
		t.Log(err)
		return
	}
	t.Log(string(marshal))
}
