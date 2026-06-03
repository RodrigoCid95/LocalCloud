package cmd

import (
	"fmt"
	"localcloud/core"
	"localcloud/types"
	"os"
	"slices"
	"text/tabwriter"

	"github.com/spf13/cobra"
)

func init() {
	usersCmd := &cobra.Command{
		Use:   "users",
		Short: "Gestor de usuarios de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("LocalCloud CLI.\nUsa 'lc users --help' para ver los comandos.")
		},
	}

	var uid int
	var user string
	var name string
	var password string
	var fullName string
	var email string
	var phone string
	var gName string
	var all bool
	var isJson bool

	usersAddCmd := &cobra.Command{
		Use:   "add",
		Short: "Agrega un nuevo usuario para acceder desde LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			um := &core.UsersManager{}
			result, err := um.Get(name)
			exitOnError(err)
			if result != nil {
				fmt.Printf("El usuario \"%s\" ya existe.\n", name)
				return
			}
			uid, err := um.Create(gName, types.NewUser{
				Name:     name,
				FullName: fullName,
				Email:    email,
				Phone:    phone,
				Password: password,
			})
			exitOnError(err)
			sm := &core.SambaManager{}
			err = sm.Put(name, password)
			exitOnError(err)
			err = sm.SetPassword(name, password)
			exitOnError(err)
			fmt.Printf("El usuario \"%s\" fue creado con éxito con el uid \"%d\".\n", name, *uid)
		},
	}

	usersAddCmd.Flags().StringVarP(&name, "name", "n", "", "Nombre del usuario.")
	exitOnError(usersAddCmd.MarkFlagRequired("name"))
	usersAddCmd.Flags().StringVarP(&password, "password", "p", "", "Contraseña del usuario.")
	exitOnError(usersAddCmd.MarkFlagRequired("password"))
	usersAddCmd.Flags().StringVarP(&fullName, "full-name", "f", "", "Nombre completo del usuario.")
	usersAddCmd.Flags().StringVarP(&email, "email", "e", "", "Correo electrónico del usuario.")
	usersAddCmd.Flags().StringVarP(&phone, "phone", "P", "", "Teléfono del usuario.")
	usersAddCmd.Flags().StringVarP(&gName, "group", "g", "lc", "Grupo del usuario (si el grupo no existe se creará).")

	usersCmd.AddCommand(usersAddCmd)

	usersDeleteCmd := &cobra.Command{
		Use:   "delete",
		Short: "Elimina un usuario de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			if uid < 0 {
				fmt.Println("El UID no puede ser negativo.")
				return
			}
			um := &core.UsersManager{}
			result, err := um.GetByUid(uid)
			exitOnError(err)
			if result == nil {
				fmt.Printf("El usuario con el uid \"%d\" no existe.\n", uid)
				return
			}
			gm := &core.GroupManager{}
			userList, err := gm.GetUsers("lc")
			exitOnError(err)
			if !slices.Contains(*userList, result.Name) {
				fmt.Println("No se puede eliminar un usuario del sistema.")
				return
			}
			err = um.Delete(uid)
			exitOnError(err)
			sm := &core.SambaManager{}
			err = sm.Delete(result.Name)
			exitOnError(err)
			fmt.Println("El usuario fue eliminado con éxito.")
		},
	}

	usersDeleteCmd.Flags().IntVarP(&uid, "uid", "u", 0, "UID del usuario a eliminar.")
	exitOnError(usersDeleteCmd.MarkFlagRequired("uid"))

	usersCmd.AddCommand(usersDeleteCmd)

	usersListCmd := &cobra.Command{
		Use:   "list",
		Short: "Muestra la lista de usuarios de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			um := &core.UsersManager{}
			results, err := um.GetAll()
			exitOnError(err)

			users := []types.User{}
			usersOfLCGroup := []string{}
			if !all {
				gm := core.GroupManager{}
				userList, err := gm.GetUsers("lc")
				exitOnError(err)
				usersOfLCGroup = *userList
			}

			for _, result := range *results {
				if all || slices.Contains(usersOfLCGroup, result.Name) {
					users = append(users, types.User{
						Uid:      result.Uid,
						Name:     result.Name,
						FullName: result.FullName,
						Email:    result.Email,
						Phone:    result.Phone,
					})
				}
			}

			if isJson {
				printJSON(users)
				return
			}

			w := tabwriter.NewWriter(os.Stdout, 1, 1, 2, ' ', 0)
			fmt.Fprintln(w, "UID\tNombre\tNombre completo\tEmail\tTeléfono")
			fmt.Fprintln(w, "---\t------\t---------------\t-----\t--------")
			for _, user := range users {
				fmt.Fprintf(w, "%d\t%s\t%s\t%s\t%s\n", user.Uid, user.Name, user.FullName, user.Email, user.Phone)
			}
			flushTable(w)
		},
	}

	usersListCmd.Flags().BoolVarP(&all, "all", "a", false, "Muestra todos los usuarios (incluidos los del sistema).")
	usersListCmd.Flags().BoolVarP(&isJson, "json", "j", false, "Muestra los resultados en formato JSON.")

	usersCmd.AddCommand(usersListCmd)

	usersSetPasswordCmd := &cobra.Command{
		Use:   "passwd",
		Short: "Actualiza la contraseña de un usuario de LocalCloud (incluyendo su contraseña de Samba).",
		Run: func(cmd *cobra.Command, args []string) {
			um := &core.UsersManager{}
			result, err := um.Get(user)
			exitOnError(err)
			if result == nil {
				fmt.Printf("El usuario \"%s\" no existe.\n", user)
				return
			}
			gm := &core.GroupManager{}
			userList, err := gm.GetUsers("lc")
			exitOnError(err)
			if !slices.Contains(*userList, user) {
				fmt.Println("No se puede actualizar un usuario del sistema.")
				return
			}
			err = um.SetPassword(user, password)
			exitOnError(err)
			sm := &core.SambaManager{}
			err = sm.SetPassword(user, password)
			exitOnError(err)
			fmt.Println("La contraseña se actualizó correctamente.")
		},
	}

	usersSetPasswordCmd.Flags().StringVarP(&user, "user", "u", "", "Nombre de usuario.")
	exitOnError(usersSetPasswordCmd.MarkFlagRequired("user"))
	usersSetPasswordCmd.Flags().StringVarP(&password, "password", "p", "", "Nueva contraseña.")
	exitOnError(usersSetPasswordCmd.MarkFlagRequired("password"))

	usersCmd.AddCommand(usersSetPasswordCmd)

	usersUpdateCmd := &cobra.Command{
		Use:   "update",
		Short: "Actualiza la info de un usuario de LocalCloud.",
		Run: func(cmd *cobra.Command, args []string) {
			um := &core.UsersManager{}
			result, err := um.Get(name)
			exitOnError(err)
			if result == nil {
				fmt.Printf("El usuario \"%s\" no existe.\n", name)
				return
			}
			gm := &core.GroupManager{}
			userList, err := gm.GetUsers("lc")
			exitOnError(err)
			if !slices.Contains(*userList, name) {
				fmt.Println("No se puede actualizar un usuario del sistema.")
				return
			}
			err = um.Update(name, types.DataUser{
				FullName: fullName,
				Email:    email,
				Phone:    phone,
			})
			exitOnError(err)
			fmt.Printf("El usuario \"%s\" se actualizó correctamente.\n", name)
		},
	}

	usersUpdateCmd.Flags().StringVarP(&name, "user", "u", "", "Nombre del usuario.")
	exitOnError(usersUpdateCmd.MarkFlagRequired("user"))
	usersUpdateCmd.Flags().StringVarP(&fullName, "full-name", "f", "", "Nombre completo del usuario.")
	usersUpdateCmd.Flags().StringVarP(&email, "email", "e", "", "Correo electrónico del usuario.")
	usersUpdateCmd.Flags().StringVarP(&phone, "phone", "P", "", "Teléfono del usuario.")

	usersCmd.AddCommand(usersUpdateCmd)

	rootCmd.AddCommand(usersCmd)
}
