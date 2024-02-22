package wxMiniprogram

import (
	"fmt"
	"github.com/dop251/goja"
	"io/ioutil"
	"path/filepath"
	"strings"
)

func SplitJs(file, mainDir string) {
	var isSubPkg = false
	if mainDir != "" {
		isSubPkg = true
	}
	var outputDir = filepath.Dir(file)
	if isSubPkg {
		outputDir = mainDir
	}
	bytes, err := ioutil.ReadFile(file)
	if err != nil {
		return
	}
	codeString := string(bytes)
	needDelList := make(map[string]int)
	vm := goja.New()

	vm.Set("require", func(call goja.FunctionCall) goja.Value { return goja.Undefined() })
	vm.Set("define", func(call goja.FunctionCall) goja.Value {
		code := strings.TrimSpace(call.Argument(1).String())
		bcode := code
		if strings.HasPrefix(code, `"use strict";`) || strings.HasPrefix(code, "'use strict';") {
			code = code[13:]
		} else if (strings.HasPrefix(code, "(function() { \"use strict\";") || strings.HasPrefix(code, "(function() { 'use strict';")) && strings.HasSuffix(code, "})();") {
			code = code[25 : len(code)-5]
		}
		res, _ := JsBeautify(code)
		if res == "" {
			res, _ = JsBeautify(bcode)
		}
		filePath := filepath.Join(outputDir, file)
		if err := ioutil.WriteFile(filePath, []byte(res), 0644); err != nil {
			fmt.Println("Failed to write file:", err)
		}
		needDelList[filePath] = -8
		return goja.Undefined()
	})

	vm.Set("definePlugin", func(call goja.FunctionCall) goja.Value { return goja.Undefined() })
	vm.Set("requirePlugin", func(call goja.FunctionCall) goja.Value { return goja.Undefined() })

	if isSubPkg {
		codeString = codeString[strings.Index(string(codeString), "define("):]
	}

	fmt.Println("splitJs:", file)
	if _, err := vm.RunString(codeString); err != nil {
		fmt.Println("JavaScript execution error:", err)
	}

	fmt.Println("Splitting \"" + file + "\" done.")

	if needDelList[file] == 0 {
		needDelList[file] = 8
	}
	//doBack

}

func JsBeautify(code string) (string, error) {
	return code, nil
	//m := minify.New()
	//m.AddFunc("text/javascript", js.Minify)
	//
	//output := &strings.Builder{}
	//if err := m.Minify("text/javascript", output, strings.NewReader(code)); err != nil {
	//	return "", nil
	//}
	//return output.String(), nil
}
