package main

import (
	"fine-server/cmd"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		return
	}
}
