package cmd

import (
	"fmt"
	"github.com/fasnow/ghttp"
	"github.com/spf13/cobra"
	"os"
)

var rootCmd = &cobra.Command{
	Use:   "fine",
	Short: " ",
	Long:  ` `,
	//TraverseChildren: true,
	Run: func(cmd *cobra.Command, args []string) {
	},
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if proxy != "" {
			err := ghttp.SetGlobalProxy(proxy)
			if err != nil {
				fmt.Println(err)
				os.Exit(1)
			}
		}
	},
}

// Execute executes the root command.
func Execute() error {
	return rootCmd.Execute()
}

func InitProxyCmd() {
	rootCmd.PersistentFlags().StringVar(&proxy, "proxy", "", "代理服务器，支持http、socks5:\n"+
		"http://user:pass@host:port\n"+
		"socks5://user:pass@host:port")
}

func init() {
	initConfig()
	InitProxyCmd()
}
func initConfig() {

}
