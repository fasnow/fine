package httpx

import (
	"bufio"
	"fine/backend/app"
	"fmt"
	"os/exec"
	"reflect"
	runtime2 "runtime"
	"syscall"
	"testing"
)

func TestPing(t *testing.T) {
	cmd := exec.Command("D:\\Tools\\vulnScan\\httpx\\httpx.exe", "-sc", "-cl", "-title", "-u", "http://185.39.51.142/")
	if runtime2.GOOS == "windows" {
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	}

	stdout, _ := cmd.StdoutPipe()
	//stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		t.Log(err)
		return
	}
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		//decodeBytes, _ := simplifiedchinese.GB18030.NewDecoder().Bytes(scanner.Bytes())
		fmt.Println(string(scanner.Bytes()))
	}
}

func TestBridge_Run(t *testing.T) {

}

func TestBridge_Stop(t *testing.T) {
	type fields struct {
		cmd *exec.Cmd
		app *app.App
	}
	tests := []struct {
		name    string
		fields  fields
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &Bridge{
				cmd: tt.fields.cmd,
				app: tt.fields.app,
			}
			if err := r.Stop(); (err != nil) != tt.wantErr {
				t.Errorf("Stop() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestNewHttpxBridge(t *testing.T) {
	type args struct {
		app *app.App
	}
	tests := []struct {
		name string
		args args
		want *Bridge
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NewHttpxBridge(tt.args.app); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewHttpxBridge() = %v, want %v", got, tt.want)
			}
		})
	}
}
