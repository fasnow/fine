package httpx

import (
	"fine/backend/application"
	"reflect"
	"testing"
)

func TestBridge_Run(t *testing.T) {
	app := application.DefaultApp
	c := NewHttpxBridge(app)
	id, err := c.Run("/Users/fasnow/Tools/bin/httpx/httpx", "-sc -cl -title", "baidu.com")
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(id)

}

func TestNewHttpxBridge(t *testing.T) {
	type args struct {
		app *application.Application
	}
	tests := []struct {
		name string
		args args
		want *Bridge
	}{
		// TODO: CreateQueryField test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NewHttpxBridge(tt.args.app); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewHttpxBridge() = %v, want %v", got, tt.want)
			}
		})
	}
}
