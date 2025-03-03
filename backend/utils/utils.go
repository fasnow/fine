package utils

import (
	"golang.org/x/net/html"
	"gorm.io/gorm"
	"os"
	"strings"
	"time"
)

func GetTableName(db *gorm.DB, model interface{}) string {
	stmt := &gorm.Statement{DB: db}
	stmt.Parse(model)
	return stmt.Schema.Table
}

func StringSliceContain(slice []string, target string) bool {
	for _, str := range slice {
		if str == target {
			return true
		}
	}
	return false
}

func RemoveEmptyAndDuplicateString(list []string) []string {
	uniqueMap := make(map[string]bool)
	var result []string
	for _, str := range list {
		v := strings.TrimSpace(str)
		if v != "" && !uniqueMap[v] {
			uniqueMap[v] = true
			result = append(result, v)
		}
	}
	return result
}

func RemoveEmptyStrings(slice []string) []string {
	result := make([]string, 0)
	for _, str := range slice {
		if str != "" {
			result = append(result, str)
		}
	}
	return result
}

func RemoveEmptyAndDuplicateAndJoinStrings(list []string, sep string) string {
	list = RemoveEmptyAndDuplicateString(list)
	if len(list) == 0 {
		return ""
	}
	return strings.Join(list, sep)
}

func GenFilenameTimestamp() string {
	formattedTime := time.Now().Format("2006-01-02-15-04-05")
	return formattedTime
}

func GenTimestampOutput() string {
	formattedTime := time.Now().Format("2006/01/02 15:04:05")
	return formattedTime
}

func HtmlHasID(n *html.Node, id string) bool {
	for _, attr := range n.Attr {
		if attr.Key == "id" && attr.Val == id {
			return true
		}
	}
	return false
}

func SaveToZip() {

}

func SaveToTxt() {

}

func GetFileContent(filename string) ([]byte, error) {
	return os.ReadFile(filename)
}
