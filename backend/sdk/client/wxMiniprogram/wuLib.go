package wxMiniprogram

import "strings"

func ChangeExt(name, ext string) string {
	return name[0:strings.LastIndex(name, ".")] + ext
}
