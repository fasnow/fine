package wechat

import (
	"embed"
	"fine/backend/app"
	"fine/backend/config"
	"fine/backend/runtime"
	"fine/backend/utils"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	runtime2 "runtime"
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
	//读取加密的wxapkg包并解密到指定文件
	bytes, err := os.ReadFile(filepath.Join(config.GetSingleton().GetWechat().AppletPath, id, version, "__APP__.wxapkg"))
	if err != nil {
		return err
	}
	decrypted, err := Decrypt(bytes, id, "saltiest", "the iv: 16 bytes")
	if err != nil {
		return err
	}
	var targetFile = filepath.Join(config.GetSingleton().GetWechat().DataCachePath, id, version+".wxapkg")
	if err := utils.WriteFile(targetFile, decrypted, 0666); err != nil {
		return err
	}

	var pattern = "decompile*.exe"
	if runtime2.GOOS != "windows" {
		pattern = "decompile*"
	}
	file, err := os.CreateTemp("", pattern)
	if err != nil {
		return err
	}
	defer func(path string) {
		_ = os.Remove(path)
	}(file.Name())
	data, err := decompile.ReadFile("decompile")
	if err != nil {
		return err
	}
	_, err = file.Write(data)
	if err != nil {
		return err
	}

	//先关闭文件流,不然cmd无法执行
	exePath := file.Name()
	file.Close()

	// 执行嵌入的文件
	cmd := exec.Command(exePath, targetFile)
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
	//	defer os.Remove(targetFile)
	//}()
	//return nil
}
