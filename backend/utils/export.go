package utils

import (
	"github.com/xuri/excelize/v2"
	"path/filepath"
	"strconv"
	"strings"
)

func ColumnNumberToName(n int) string {
	name := ""
	for n > 0 {
		n--
		name = string(byte(n%26)+'A') + name
		n /= 26
	}
	return name
}

func SaveToExcel(data [][]any, outfile string) error {
	file := excelize.NewFile()
	sheetName := "Sheet1"

	// 添加数据
	for i := 0; i < len(data); i++ {
		row := data[i]
		startCell, err := excelize.JoinCellName("A", i+1)
		if err != nil {
			return err
		}
		if i == 0 {
			// 首行大写
			for j := 0; j < len(row); j++ {
				if value, ok := row[j].(string); ok {
					row[j] = strings.ToUpper(value)
				}
			}
			if err = file.SetSheetRow(sheetName, startCell, &row); err != nil {
				return err
			}
			continue
		}
		if err = file.SetSheetRow(sheetName, startCell, &row); err != nil {
			return err
		}
	}

	border := []excelize.Border{
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
	}

	// 表头格式
	headerStyle, err := file.NewStyle(&excelize.Style{
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#d0cece"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
		Border:    border,
	})
	if err != nil {
		return err
	}
	err = file.SetCellStyle(sheetName, "A1", ColumnNumberToName(len(data[0]))+"1", headerStyle)
	if err != nil {
		return err
	}

	// 数据格式
	dataStyle, err := file.NewStyle(&excelize.Style{
		Fill:      excelize.Fill{Type: "pattern"},
		Alignment: &excelize.Alignment{Horizontal: "left"},
		Border:    border,
	})
	if err != nil {
		return err
	}

	FreezeFirstRow(file, sheetName)

	if err = file.SetCellStyle(sheetName, "A2", ColumnNumberToName(len(data[0]))+strconv.Itoa(len(data)), dataStyle); err != nil {
		return err
	}
	if err := CreateDirectory(filepath.Dir(outfile)); err != nil {
		return err
	}
	if err2 := file.SaveAs(outfile); err2 != nil {
		return err2
	}
	return nil
}
