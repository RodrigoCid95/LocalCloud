package cmd

import (
	"fmt"
	"localcloud/core"
	"localcloud/types"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"
)

func init() {
	permissionsCmd := &cobra.Command{
		Use:   "permissions",
		Short: "Gestor de permisos de apps de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("LocalCloud CLI.\nUsa lc permissions --help para ver los comandos.")
		},
	}

	var isJson bool

	permissionsListCmd := &cobra.Command{
		Use:   "list <package name>",
		Short: "Muestra una lista de permisos asignados a una app de LocalCloud.",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("La aplicación no esta instalada.")
				return
			}
			pm := &core.Permissions{}
			permissions := pm.Get(packageName)

			if isJson {
				printJSON(permissions)
				return
			}

			w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
			fmt.Fprintln(w, "Nombre\tDescripción\tEstado")
			fmt.Fprintln(w, "------\t-----------\t------")
			for _, permission := range permissions {
				status := "Deshabilidato"
				if permission.Enable {
					status = "Habilidato"
				}
				fmt.Fprintf(w, "%s\t%s\t%s\n", permission.Name, permission.Description, status)
			}
			flushTable(w)
		},
	}

	permissionsListCmd.Flags().BoolVarP(&isJson, "json", "j", false, "Muestra la lista de resultados en formato JSON.")

	permissionsCmd.AddCommand(permissionsListCmd)

	permissionsCmd.AddCommand(&cobra.Command{
		Use:   "enable <package name> <permission>",
		Short: "Habilita un permiso de una aplicación de LocalCloud.",
		Args:  cobra.ExactArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			permission := args[1]

			am := &core.AppsManager{}

			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("El paquete no esta instalado.")
				return
			}

			pm := &core.Permissions{}
			if !pm.IsValid(permission) {
				fmt.Println("El permiso no es válido.")
				return
			}

			pm.Put(packageName, permission, true)
			fmt.Println("Permiso habilitado.")
		},
	})

	permissionsCmd.AddCommand(&cobra.Command{
		Use:   "disable <package name> <permission>",
		Short: "Deshabilita un permiso de una aplicación de LocalCloud.",
		Args:  cobra.ExactArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			permission := args[1]

			am := &core.AppsManager{}

			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("El paquete no esta instalado.")
				return
			}

			pm := &core.Permissions{}
			if !pm.IsValid(permission) {
				fmt.Println("El permiso no es valido.")
				return
			}

			pm.Put(packageName, permission, false)
			fmt.Println("Permiso deshabilitado.")
		},
	})

	permissionsStatusCmd := &cobra.Command{
		Use:   "status <package name> <permission name>",
		Short: "Devuelve el estatus de un permiso de una aplicación de LocalCloud.",
		Args:  cobra.ExactArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			permissionName := args[1]

			am := &core.AppsManager{}

			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("El paquete no esta instalado.")
				return
			}

			pm := &core.Permissions{}
			permissionList := pm.Get(packageName)
			var permission *types.Permission = nil

			for _, item := range permissionList {
				if strings.EqualFold(item.Name, permissionName) {
					permission = &item
					break
				}
			}

			if permission == nil {
				fmt.Println("El permiso no es válido.")
				return
			}

			if isJson {
				printJSON(map[string]any{
					"name":   permission.Name,
					"enable": permission.Enable,
				})
				return
			}

			w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
			fmt.Fprintln(w, "Permiso\tEstado")
			fmt.Fprintln(w, "-------\t------")
			status := "Deshabilitado"
			if permission.Enable {
				status = "Habilitado"
			}
			fmt.Fprintf(w, "%s\t%s\n", strings.ToUpper(permission.Name), status)
			flushTable(w)
		},
	}

	permissionsStatusCmd.Flags().BoolVarP(&isJson, "json", "j", false, "Muestra la lista de resultados en formato JSON.")

	permissionsCmd.AddCommand(permissionsStatusCmd)

	rootCmd.AddCommand(permissionsCmd)
}
