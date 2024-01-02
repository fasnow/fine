package cmd

import (
	"bufio"
	"fine-server/sdk/ip138"
	"fine-server/utils"
	"fmt"
	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/jedib0t/go-pretty/v6/text"
	"github.com/spf13/cobra"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var Ip138Cmd = &cobra.Command{
	Use:   "ip138",
	Short: "",
	Long:  ``,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		// 检查互斥选项
		if ips != "" && domains != "" {
			return fmt.Errorf("域名和IP不能同时设置")
		}
		if ipFile != "" && domainFile != "" {
			return fmt.Errorf("域名文件和IP文件不能同时设置")
		}
		if ips != "" && ipFile != "" {
			return fmt.Errorf("IP和IP文件不能同时设置")
		}
		if domains != "" && domainFile != "" {
			return fmt.Errorf("域名和域名文件不能同时设置")
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		runIp138Cmd()
	},
}

func init() {
	Ip138Cmd.Flags().StringVarP(&domains, "domain", "d", "", "eg: example.com,http://example.com,http://example.com:9380/path")
	Ip138Cmd.Flags().StringVar(&domainFile, "df", "", "domain file,one value per line")
	Ip138Cmd.Flags().StringVarP(&ips, "ip", "i", "", "eg: 127.0.0.1,127.0.0.2")
	Ip138Cmd.Flags().StringVar(&ipFile, "if", "", "ip file,one value per line")
	Ip138Cmd.Flags().StringVarP(&output, "output", "o", "./", "output file")
	rootCmd.AddCommand(Ip138Cmd)
}

// 调用查询
func runIp138Cmd() {
	c := ip138.NewClient()
	if domains != "" {
		domainList := utils.RemoveEmptyAndDuplicateStrings(strings.Split(domains, ","))
		t := table.NewWriter()
		t.SetOutputMirror(os.Stdout)
		t.Style().Format = table.FormatOptions{
			Footer: text.FormatDefault,
			Header: text.FormatDefault,
			Row:    text.FormatDefault,
		}
		for _, domain := range domainList {
			items, msg, err := c.Domain.GetCurrentIP(domain)
			if err != nil {
				fmt.Println(err)
				return
			}
			if len(items) == 0 {
				fmt.Println("暂未查询到")
				return
			}
			if msg != "" {
				fmt.Println(msg)
				return
			}
			t.ResetHeaders()
			t.ResetRows()
			t.AppendHeader(table.Row{domain, domain}, table.RowConfig{AutoMerge: true})
			for _, item := range items {
				//t.SetStyle(table.StyleLight) //有bug 弃用
				t.AppendRow([]interface{}{item.IP, item.LocationOrDate})
			}
			t.Render()
		}
		return
	}
	if ips != "" {
		t := table.NewWriter()
		t.SetOutputMirror(os.Stdout)
		ipList := utils.RemoveEmptyAndDuplicateStrings(strings.Split(ips, ","))
		for _, ip := range ipList {
			items, err := c.IP.GetCurrentDomain(ip)
			if err != nil {
				fmt.Println(err)
				return
			}
			if len(items) == 0 {
				fmt.Println("暂未查询到")
				return
			}
			t.ResetHeaders()
			t.ResetRows()
			t.AppendHeader(table.Row{ip, ip}, table.RowConfig{AutoMerge: true})
			//t.SetStyle(table.StyleLight) //有bug 弃用
			for _, item := range items {
				t.AppendRow([]interface{}{item.Domain, item.Date})
			}
			t.Render()
		}
		return
	}

	if domainFile != "" {
		// 转换输入路径为绝对路径
		absPath, err := filepath.Abs(domainFile)
		if err != nil {
			fmt.Println("无法获取绝对路径:", err)
			return
		}

		// 检查文件是否存在
		_, err = os.Stat(absPath)
		if os.IsNotExist(err) {
			fmt.Println("文件不存在:", absPath)
			return
		}

		// 打开文件并按行读取
		file, err := os.Open(absPath)
		if err != nil {
			fmt.Println("无法打开文件:", err)
			return
		}
		defer file.Close()

		var domainList []string
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			if domain := strings.TrimSpace(scanner.Text()); domain != "" {
				domainList = append(domainList, domain)
			}
		}

		if err := scanner.Err(); err != nil {
			fmt.Println("读取文件时发生错误:", err)
			return
		}

		t := table.NewWriter()
		t.SetOutputMirror(os.Stdout)
		t.Style().Format = table.FormatOptions{
			Footer: text.FormatDefault,
			Header: text.FormatDefault,
			Row:    text.FormatDefault,
		}

		for _, domain := range domainList {
			items, msg, err := c.Domain.GetCurrentIP(domain)
			if err != nil {
				fmt.Println(err)
				return
			}
			if len(items) == 0 {
				fmt.Println(domain + "    暂未查询到")
				continue
			}
			if msg != "" {
				fmt.Println(domain + "    " + msg)
				continue
			}
			t.ResetHeaders()
			t.ResetRows()
			t.AppendHeader(table.Row{domain, domain}, table.RowConfig{AutoMerge: true})
			for _, item := range items {
				//t.SetStyle(table.StyleLight) //有bug 弃用
				t.AppendRow([]interface{}{item.IP, item.LocationOrDate})
			}
			t.Render()
			time.Sleep(1 * time.Second)
		}
		return
	}
	if ipFile != "" {
		// 转换输入路径为绝对路径
		absPath, err := filepath.Abs(ipFile)
		if err != nil {
			fmt.Println("无法获取绝对路径:", err)
			return
		}

		// 检查文件是否存在
		_, err = os.Stat(absPath)
		if os.IsNotExist(err) {
			fmt.Println("文件不存在:", absPath)
			return
		}

		// 打开文件并按行读取
		file, err := os.Open(absPath)
		if err != nil {
			fmt.Println("无法打开文件:", err)
			return
		}
		defer file.Close()

		var ipList []string
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			if domain := strings.TrimSpace(scanner.Text()); domain != "" {
				ipList = append(ipList, domain)
			}
		}

		if err := scanner.Err(); err != nil {
			fmt.Println("读取文件时发生错误:", err)
			return
		}
		t := table.NewWriter()
		t.SetOutputMirror(os.Stdout)
		for _, ip := range ipList {
			items, err := c.IP.GetCurrentDomain(ip)
			if err != nil {
				fmt.Println(err)
				return
			}
			if len(items) == 0 {
				fmt.Println("暂未查询到")
				return
			}
			t.ResetHeaders()
			t.ResetRows()
			t.AppendHeader(table.Row{ip, ip}, table.RowConfig{AutoMerge: true})
			//t.SetStyle(table.StyleLight) //有bug 弃用
			for _, item := range items {
				t.AppendRow([]interface{}{item.Domain, item.Date})
			}
			t.Render()
		}
		return
	}
}
