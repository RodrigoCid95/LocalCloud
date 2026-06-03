package cmd

import (
	"fmt"
	"localcloud/core"
	"localcloud/utils"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"
)

type App struct {
	PackageName      string `json:"package_name"`
	Title            string `json:"title"`
	Description      string `json:"description"`
	Author           string `json:"author"`
	InstallationPath string `json:"installation_path"`
}

func init() {
	appsCmd := &cobra.Command{
		Use:   "apps",
		Short: "Gestor de aplicaciones de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("LocalCloud CLI.\nUsa 'lc apps --help' para ver los comandos.")
		},
	}

	var isJson bool
	var nameSystemApp string
	var includesystemApps bool
	var updateSystemApp bool

	appsInstallCmd := &cobra.Command{
		Use:   "install <file>",
		Short: "Instala una app de LocalCloud.",
		Long: `Instala una app de LocalCloud a partir de un archivo.
		
El argumento <file> debe ser una ruta válida de un archivo de instalación de LocalCloud.`,
		Args: cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			isSistemApp := nameSystemApp != ""
			path, err := filepath.Abs(args[0])
			exitOnError(err)
			if !utils.ExistsPath(path) {
				fmt.Printf("La ruta \"%s\" no existe.\n", path)
				return
			}
			if utils.IsDir(path) {
				fmt.Printf("La ruta \"%s\" no es un archivo.\n", path)
				return
			}

			fileName := filepath.Base(path)
			ext := filepath.Ext(fileName)
			packageName := strings.TrimSuffix(fileName, ext)
			targetPackageName := packageName
			if isSistemApp {
				targetPackageName = nameSystemApp
			}

			am := &core.AppsManager{}
			app := am.GetByPackageName(targetPackageName, isSistemApp)
			if app != nil {
				fmt.Printf("La aplicación \"%s\" ya esta instalada.\n", targetPackageName)
				return
			}

			err = am.Install(path, nameSystemApp)
			exitOnError(err)

			fmt.Println("Aplicación instalada correctamente.")
		},
	}
	appsInstallCmd.Flags().StringVarP(&nameSystemApp, "system-name", "s", "", "Define el nombre de una app de sistema.")
	appsCmd.AddCommand(appsInstallCmd)

	appsUpdateCmd := &cobra.Command{
		Use:   "update <file> <package name>",
		Short: "Actualiza una app de LocalCloud.",
		Long: `Actualiza una app de LocalCloud a partir de un archivo.
		
El argumento <file> debe ser una ruta válida de un archivo de instalación de LocalCloud.
El argumento <package name> debe ser el nombre de la app instalada que se actualizará.`,
		Args: cobra.ExactArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			path, err := filepath.Abs(args[0])
			exitOnError(err)
			if !utils.ExistsPath(path) {
				fmt.Printf("La ruta \"%s\" no existe.\n", path)
				return
			}
			if utils.IsDir(path) {
				fmt.Printf("La ruta \"%s\" no es un archivo.\n", path)
				return
			}

			packageName := args[1]
			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, updateSystemApp)
			if app == nil {
				fmt.Printf("La aplicación \"%s\" no está instalada.\n", packageName)
				return
			}

			err = am.Update(path, packageName, updateSystemApp)
			exitOnError(err)

			fmt.Println("Aplicación actualizada correctamente.")
		},
	}
	appsUpdateCmd.Flags().BoolVarP(&updateSystemApp, "system", "s", false, "Indica que la app a actualizar es una app de sistema.")
	appsCmd.AddCommand(appsUpdateCmd)

	appsListCmd := &cobra.Command{
		Use:   "list",
		Short: "Muestra la lista de apps instaladas de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			pm := &core.AppsManager{}
			results := pm.GetAll(false)
			if includesystemApps {
				results = slices.Concat(results, pm.GetAll(true))
			}
			apps := []App{}

			for _, app := range results {
				apps = append(apps, App{
					PackageName:      app.PackageName,
					Title:            app.Title,
					Description:      app.Description,
					Author:           app.Author,
					InstallationPath: app.InstallationPath,
				})
			}

			if isJson {
				printJSON(apps)
				return
			}

			w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
			fmt.Fprintln(w, "Nombre del paquete\tNombre\tDescripción\tAutor\tRuta de instalación")
			fmt.Fprintln(w, "------------------\t------\t-----------\t-----\t-------------------")
			for _, app := range apps {
				fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\n", app.PackageName, app.Title, app.Description, app.Author, app.InstallationPath)
			}
			flushTable(w)
		},
	}
	appsListCmd.Flags().BoolVarP(&isJson, "json", "j", false, "Muestra los resultados en formato JSON.")
	appsListCmd.Flags().BoolVarP(&includesystemApps, "include-system", "i", false, "Indica que se incluyan las aplicaciones del sistema.")
	appsCmd.AddCommand(appsListCmd)

	appsCmd.AddCommand(&cobra.Command{
		Use:   "uninstall <package name>",
		Short: "Desinstala una app de LocalCloud.",
		Long: `Desinstala una app de LocalCloud.
		
El argumento <package name> debe ser un nombre de paquete válido de LocalCloud.`,
		Args: cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Printf("La aplicación \"%s\" no está instalada.\n", packageName)
				return
			}

			err := am.Uninstall(packageName)
			exitOnError(err)

			um := &core.UsersManager{}
			a := &core.Assignments{}
			userList, err := um.GetAll()
			exitOnError(err)
			for _, u := range *userList {
				a.Remove(u.Uid, packageName)
			}

			fmt.Println("Aplicación desinstalada correctamente.")
		},
	})

	rootCmd.AddCommand(appsCmd)
}
