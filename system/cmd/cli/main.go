package main

import (
	"fmt"
	"localcloud/cmd/cli/cmd"
	"os"
)

func main() {
	if os.Geteuid() != 0 {
		fmt.Println("Debes contar con permisos de administrador. Intenta usar 'sudo lc'")
		return
	}
	cmd.Execute()
}
