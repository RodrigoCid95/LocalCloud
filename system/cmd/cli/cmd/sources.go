package cmd

import (
	"fmt"
	"localcloud/core"
	"os"
	"slices"
	"strconv"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"
)

func init() {
	sourcesCmd := &cobra.Command{
		Use:   "sources",
		Short: "Gestiona el acceso a fuentes externas siguiendo el pricipios de CSP(https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP).",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("LocalCloud CLI.\nUsa 'lc sources --help' para ver los comandos.")
		},
	}

	var isJson bool
	var srcType string

	sourcesListCmd := &cobra.Command{
		Use:  "list <package name>",
		Args: cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("La app no existe.")
				return
			}
			sm := &core.Sources{}
			if srcType != "" {
				if !slices.Contains(core.SourceTypesAllowed, srcType) {
					fmt.Printf("El tipo no es válido, intenta usar %s. \n", strings.Join(core.SourceTypesAllowed, ", "))
					return
				}

				sourceList := sm.Get(packageName, srcType)
				if isJson {
					printJSON(sourceList)
					return
				}
				w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
				fmt.Fprintln(w, "ID\tUrl\tDescripción\tEstado")
				fmt.Fprintln(w, "--\t---\t-----------\t------")
				for _, src := range sourceList {
					status := "Deshabilitado"
					if src.Enable {
						status = "Habilitado"
					}
					fmt.Fprintf(w, "%d\t%s\t%s\t%s\n", src.Id, src.URL, src.Description, status)
				}
				flushTable(w)
				return
			}

			sourceList := sm.GetAll(packageName)
			if isJson {
				printJSON(sourceList)
				return
			}
			w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
			fmt.Fprintln(w, "Tipo\tID\tUrl\tDescripción\tEstado")
			fmt.Fprintln(w, "----\t--\t---\t-----------\t------")
			for srcT, v := range sourceList {
				for _, src := range v {
					status := "Deshabilitado"
					if src.Enable {
						status = "Habilitado"
					}
					fmt.Fprintf(w, "%s\t%d\t%s\t%s\t%s\n", srcT, src.Id, src.URL, src.Description, status)
				}
			}
			flushTable(w)
		},
	}

	sourcesListCmd.Flags().BoolVarP(&isJson, "json", "j", false, "Muestra la lista de resultados en formato JSON.")
	sourcesListCmd.Flags().StringVarP(&srcType, "type", "t", "", "Filtra la lista de resultados por tipo de fuente.")

	sourcesCmd.AddCommand(sourcesListCmd)

	sourcesCmd.AddCommand(&cobra.Command{
		Use:   "enable <package name> <type> <id>",
		Short: "Habilita el acceso de una fuente externa en una aplicación de LocalCloud.",
		Args:  cobra.ExactArgs(3),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			srcT := args[1]
			id, err := strconv.Atoi(args[2])

			if err != nil {
				fmt.Println("El argumento id no es válido.")
				return
			}

			if !slices.Contains(core.SourceTypesAllowed, srcT) {
				fmt.Printf("El tipo no es válido, intenta usar %s. \n", strings.Join(core.SourceTypesAllowed, ", "))
				return
			}

			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("La app no está instalada.")
				return
			}

			sm := &core.Sources{}
			sm.Put(packageName, srcT, id, true)
			fmt.Println("Fuente habilitada.")
		},
	})

	sourcesCmd.AddCommand(&cobra.Command{
		Use:   "disable <package name> <type> <id>",
		Short: "Deshabilita el acceso de una fuente externa en una aplicación de LocalCloud.",
		Args:  cobra.ExactArgs(3),
		Run: func(cmd *cobra.Command, args []string) {
			packageName := args[0]
			srcT := args[1]
			id, err := strconv.Atoi(args[2])

			if err != nil {
				fmt.Println("El argumento id no es válido.")
				return
			}

			if !slices.Contains(core.SourceTypesAllowed, srcT) {
				fmt.Printf("El tipo no es válido, intenta usar %s. \n", strings.Join(core.SourceTypesAllowed, ", "))
				return
			}

			am := &core.AppsManager{}
			app := am.GetByPackageName(packageName, false)
			if app == nil {
				fmt.Println("La app no está instalada.")
				return
			}

			sm := &core.Sources{}
			sm.Put(packageName, srcT, id, false)
			fmt.Println("Fuente deshabilitada.")
		},
	})

	rootCmd.AddCommand(sourcesCmd)
}
