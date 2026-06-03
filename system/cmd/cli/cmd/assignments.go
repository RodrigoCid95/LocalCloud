package cmd

import (
	"fmt"
	"localcloud/core"
	"os"
	"slices"
	"text/tabwriter"

	"github.com/spf13/cobra"
)

type appItem struct {
	PackageName string `json:"package_name"`
	Title       string `json:"title"`
}

func init() {
	assignmentsCmd := &cobra.Command{
		Use:   "assignments",
		Short: "Gestiona las asigmaciones de aplicaciones a usuarios de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("LocalCloud CLI.\nUsa 'lc assigments --help' para ver los comandos.")
		},
	}

	var isJson bool

	assignmentsListCmd := &cobra.Command{
		Use:   "list <user name>",
		Short: "Muestra la lista de aplicaciones asignadas a un usuario de LocalCloud.",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			userName := args[0]

			um := &core.UsersManager{}
			user, err := um.Get(userName)
			exitOnError(err)

			if user == nil {
				fmt.Println("El usuario no existe.")
				return
			}

			gm := &core.GroupManager{}
			userList, err := gm.GetUsers("lc")
			exitOnError(err)

			if !slices.Contains(*userList, userName) {
				fmt.Println("El usuario no es válido.")
				return
			}

			am := &core.AppsManager{}
			appList := am.GetByUid(user.Uid)
			apps := []appItem{}

			for _, v := range appList {
				apps = append(apps, appItem{
					PackageName: v.PackageName,
					Title:       v.Title,
				})
			}

			if isJson {
				printJSON(apps)
				return
			}

			w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
			fmt.Fprintln(w, "Nombre del paquete\tNombre")
			fmt.Fprintln(w, "------------------\t------")
			for _, app := range apps {
				fmt.Fprintf(w, "%s\t%s\n", app.PackageName, app.Title)
			}
			flushTable(w)
		},
	}

	assignmentsListCmd.Flags().BoolVarP(&isJson, "json", "j", false, "Muestra los resultados en formato JSON.")

	assignmentsCmd.AddCommand(assignmentsListCmd)

	assignmentsCmd.AddCommand(&cobra.Command{
		Use:   "add <user name> <package name>",
		Short: "Asigna una app a un usuario de LocalCloud.",
		Args:  cobra.ExactArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			userName := args[0]
			packageName := args[1]

			um := &core.UsersManager{}
			user, err := um.Get(userName)
			exitOnError(err)

			if user == nil {
				fmt.Println("El usuario no existe.")
				return
			}

			gm := &core.GroupManager{}
			userList, err := gm.GetUsers("lc")
			exitOnError(err)

			if !slices.Contains(*userList, userName) {
				fmt.Println("El usuario no es válido.")
				return
			}

			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("La app no está instalada.")
				return
			}

			a := &core.Assignments{}
			a.Add(user.Uid, packageName)
			fmt.Println("Applicación asignada.")
		},
	})

	assignmentsCmd.AddCommand(&cobra.Command{
		Use:   "remove <user name> <package name>",
		Short: "Remueve la asignación de una app a un usuario de LocalCloud.",
		Args:  cobra.ExactArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			userName := args[0]
			packageName := args[1]

			um := &core.UsersManager{}
			user, err := um.Get(userName)
			exitOnError(err)

			if user == nil {
				fmt.Println("El usuario no existe.")
				return
			}

			gm := &core.GroupManager{}
			userList, err := gm.GetUsers("lc")
			exitOnError(err)

			if !slices.Contains(*userList, userName) {
				fmt.Println("El usuario no es válido.")
				return
			}

			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("La app no está instalada.")
				return
			}

			a := &core.Assignments{}
			a.Remove(user.Uid, packageName)
			fmt.Println("Applicación desasignada.")
		},
	})

	rootCmd.AddCommand(assignmentsCmd)
}
