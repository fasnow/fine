package utils

import (
	"errors"
	"fine/backend/logger"
	"github.com/fasnow/ghttp"
	"github.com/xuri/excelize/v2"
	"golang.org/x/net/html"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func RemoveEmptyAndDuplicateStrings(list []string) []string {
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
	list = RemoveEmptyAndDuplicateStrings(list)
	if len(list) == 0 {
		return ""
	}
	return strings.Join(list, sep)
}

func GetCodeAndTitle(u string) (int, string, error) {
	client := ghttp.Client{Timeout: 3 * time.Second}
	request, err := http.NewRequest("GET", u, nil)
	if err != nil {
		logger.Info(err.Error())
		return 0, "", err
	}
	resp, err := client.Do(request)
	if err != nil {
		logger.Info(err.Error())
		//if _, ok := err.(*url.Error); ok {
		return 0, "", errors.New("无法访问")
		//}
	} else {
		body, err := ghttp.GetResponseBody(resp.Body)
		if err != nil {
			logger.Info(err.Error())
			return 0, "", err
		}
		if err != nil {
			logger.Info(err.Error())
			return resp.StatusCode, "", nil
		}
		re := regexp.MustCompile("(?i)<title>(.*?)</title>")
		matches := re.FindStringSubmatch(string(body))
		if len(matches) > 1 {
			return resp.StatusCode, matches[1], nil
		} else {
			return resp.StatusCode, "", nil
		}
	}
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

func columnNumberToName(n int) string {
	name := ""
	for n > 0 {
		n--
		name = string(byte(n%26)+'A') + name
		n /= 26
	}
	return name
}

func SaveToExcel(data [][]any, outputFilepath string) error {
	file := excelize.NewFile()

	// 添加数据
	for i := 0; i < len(data); i++ {
		row := data[i]
		startCell, err := excelize.JoinCellName("A", i+1)
		if err != nil {
			logger.Info(err.Error())
			return err
		}
		if i == 0 {
			// 首行大写
			for j := 0; j < len(row); j++ {
				if value, ok := row[j].(string); ok {
					row[j] = strings.ToUpper(value)
				}
			}
			if err = file.SetSheetRow("Sheet1", startCell, &row); err != nil {
				logger.Info(err.Error())
				return err
			}
			continue
		}
		if err = file.SetSheetRow("Sheet1", startCell, &row); err != nil {
			return err
		}
	}

	// 表头颜色填充
	headerStyle, err := file.NewStyle(&excelize.Style{
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#d0cece"}, Pattern: 1, Shading: 1},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
		},
	})
	if err != nil {
		return err
	}

	err = file.SetCellStyle("Sheet1", "A1", columnNumberToName(len(data[0]))+"1", headerStyle)
	if err != nil {
		return err
	}

	// 添加边框
	dataStyle, err := file.NewStyle(&excelize.Style{
		Fill: excelize.Fill{Type: "pattern"},
		Alignment: &excelize.Alignment{
			Horizontal: "left",
		},
		Border: []excelize.Border{
			{
				Type:  "right",
				Color: "#000000",
				Style: 1,
			},
			{
				Type:  "left",
				Color: "#000000",
				Style: 1,
			},
			{
				Type:  "top",
				Color: "#000000",
				Style: 1,
			},
			{
				Type:  "bottom",
				Color: "#000000",
				Style: 1,
			},
		},
	})
	if err != nil {
		return err
	}
	err = file.SetCellStyle("Sheet1", "A1", columnNumberToName(len(data[0]))+strconv.Itoa(len(data)), dataStyle)
	if err != nil {
		return err
	}

	if err2 := file.SaveAs(outputFilepath); err2 != nil {
		return err2
	}
	return nil
}

func SaveToZip() {

}

func SaveToTxt() {

}

func GetFileContent(filename string) ([]byte, error) {
	return os.ReadFile(filename)
}

func FileExist(filePath string) bool {
	_, err := os.Stat(filePath)
	return !os.IsNotExist(err)
}
