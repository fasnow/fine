package cmd

import (
	"fine-server/server"
	"github.com/spf13/cobra"
)

var ServerCmd = &cobra.Command{
	Use:   "server",
	Short: "",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		runServer()
	},
}

func init() {
	InitServerCmd()
	rootCmd.AddCommand(ServerCmd)
}
func InitServerCmd() {
	ServerCmd.Flags().StringVar(&bind, "bind", bind, "default "+bind)
	ServerCmd.Flags().StringVar(&dataPath, "data-path", dataPath, "default "+dataPath)
}

// 调用查询
func runServer() {
	err := server.Run(
		server.Bind(bind),
		server.DataPath(dataPath),
	)
	if err != nil {
		panic(err)
	}
}
