package wechat

import (
	"embed"
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/runtime"
	"fmt"
	"github.com/yitter/idgenerator-go/idgen"
	"os"
	"os/exec"
	"path/filepath"
	runtime2 "runtime"
	"strconv"
)

type Bridge struct {
	app    *app.App
	wechat *WxMiniProgram
}

func NewWechatBridge(app *app.App) *Bridge {
	c := &Bridge{
		app:    app,
		wechat: NewClient(),
	}
	c.wechat.SetAppletPath(config.GetSingleton().GetWechat().AppletPath)
	return c
}

func (r *Bridge) GetAppletSubDir() (*WxapkgInfo, error) {
	return r.wechat.GetAppletSubDir()
}
func (r *Bridge) SetAppletPath(path string) error {
	if err := config.GetSingleton().SaveWechat(config.Wechat{AppletPath: path}); err != nil {
		return err

	}
	r.wechat.SetAppletPath(path)
	return nil
}

//go:embed decompile
var decompile embed.FS

func (r *Bridge) Decompile(id, version string) error {
	if err := os.MkdirAll(filepath.Join(config.GetSingleton().GetWechat().DataCachePath, id), 0755); err != nil {
		return err
	}
	bytes, err := os.ReadFile(filepath.Join(config.GetSingleton().GetWechat().AppletPath, id, version, "__APP__.wxapkg"))
	if err != nil {
		return err
	}
	decrypted, err := Decrypt(bytes, id, "saltiest", "the iv: 16 bytes")
	if err != nil {
		return err
	}
	var decryptedFile = filepath.Join(config.GetSingleton().GetWechat().DataCachePath, id, version+".wxapkg")

	if err := os.WriteFile(decryptedFile, decrypted, 0666); err != nil {
		return err
	}

	// 从嵌入文件系统中读取文件内容
	data, err := decompile.ReadFile("decompile")
	if err != nil {
		return err
	}

	// 创建临时目录
	tmpDir, err := os.MkdirTemp("", "fine-temp")
	if err != nil {
		return err
	}

	// 将嵌入的文件内容写入临时目录中
	exePath := filepath.Join(tmpDir, strconv.Itoa(int(idgen.NextId()))+"decompile.exe")
	if runtime2.GOOS != "windows" {
		exePath = filepath.Join(tmpDir, strconv.Itoa(int(idgen.NextId()))+"decompile")
	}
	if err := os.WriteFile(exePath, data, 0644); err != nil {
		return err
	}

	// 执行嵌入的文件
	cmd := exec.Command(exePath, decryptedFile)
	fmt.Println(exePath, decryptedFile)
	runtime.HideCmdWindow(cmd)
	if err := cmd.Run(); err != nil {
		fmt.Println(err)
		return err
	}
	return fmt.Errorf("返回值")
	//stderr, _ := cmd.StderrPipe()
	//if err := cmd.Start(); err != nil {
	//	return err
	//}
	//go func() {
	//	scanner := bufio.NewScanner(stderr)
	//	for scanner.Scan() {
	//		event.Emit(event.GetSingleton().DecompileWxMiniProgram, string(scanner.Bytes()))
	//	}
	//}()
	//go func() {
	//	err := cmd.Wait()
	//	if err != nil {
	//		fmt.Println("Error waiting for command:", err)
	//	}
	//	defer os.RemoveAll(tmpDir)
	//	defer os.Remove(decryptedFile)
	//}()
	//return nil
}
