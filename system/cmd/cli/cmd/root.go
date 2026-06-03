package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "lc",
	Short: "LocalCloud CLI es una CLI de LocalCloud",
	Long:  "Puedes usar esta CLI para gestionar tu servidor NAS de LocalCloud.",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("LocalCloud CLI. Usa 'lc --help' para ver los comandos.")
	},
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
