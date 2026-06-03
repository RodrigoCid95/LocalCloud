package app

import (
	"bytes"
	"embed"
	"html/template"
	nAPI "localcloud/cmd/server/api"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"localcloud/utils"
	"log"
	"net/http"
	"slices"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/labstack/echo/v4"
)

//go:embed www/sdk.js
var sdkFS embed.FS

type RegisterArgs struct {
	E           *echo.Echo
	Manifest    *types.AppResult
	Modules     *modules.List
	IsSystemApp bool
	Mpm         *managers.MemoryPermissionsManager
	Msm         *managers.MemorySourcesManager
	Am          *managers.AssignmentsManager
}

func Register(args RegisterArgs) {
	args.Mpm.RegisterApp(args.Manifest)
	args.Msm.RegisterApp(args.Manifest)
	route := "/app/" + args.Manifest.PackageName
	if args.IsSystemApp {
		route = "/" + args.Manifest.PackageName
	}

	log.Printf("[Server] Register route %s\n", route)

	paths := args.Modules.AppsManager.GetPaths(args.Manifest.PackageName, args.IsSystemApp)
	data := map[string]string{
		"BasePath": route,
	}

	g := args.E.Group(route)
	g.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !args.Mpm.CheckApp(args.Manifest.PackageName) {
				return c.NoContent(http.StatusNotFound)
			}

			c.Set("name", args.Manifest.PackageName)

			return next(c)
		}
	})
	if args.Manifest.PackageName == "login" {
		g.Use(nAPI.RedirectAuthenticatedUsers(args.Am))
	} else if args.IsSystemApp {
		g.Use(nAPI.RequireSession(args.Am))
	} else {
		g.Use(nAPI.RequireAssignedApp(args.Manifest.PackageName, args.Am))
	}

	g.GET("/sdk.js", func(c echo.Context) error {
		js, err := sdkFS.ReadFile("www/sdk.js")
		if err != nil {
			return err
		}

		define := map[string]string{
			"BASE_URL": "'" + route + "/api/'",
		}

		permissionApp := args.Mpm.Get(args.Manifest.PackageName)
		for _, p := range core.PermissionsAllowed {
			value := "false"
			if slices.Contains(permissionApp, p) {
				value = "true"
			}

			define[p] = value
		}

		result := api.Transform(string(js), api.TransformOptions{
			Loader: api.LoaderJS,
			Define: define,
		})

		return c.Blob(http.StatusOK, "application/javascript", result.Code)
	})

	if args.Manifest.PackageName != "login" {
		gAPI := g.Group("/api")
		gAPI.Use(nAPI.RequireMatchingRefererPath())

		nAPI.RegisterAPI(nAPI.RegisterAPIArgs{
			GAPI:     gAPI,
			Manifest: args.Manifest,
			Modules:  args.Modules,
			Mpm:      args.Mpm,
			Msm:      args.Msm,
			Am:       args.Am,
		})
	}

	g.Static("/", paths.Code)

	g.GET(
		"",
		func(c echo.Context) error {
			csp := "default-src 'self';"
			sources := args.Msm.Get(args.Manifest.PackageName)
			for _, sType := range core.SourceTypesAllowed {
				sourceList := []string{}
				if values, ok := sources[sType]; ok {
					sourceList = values
				}

				value := sType + "-src 'self'"
				for _, source := range sourceList {
					value += " " + source
				}
				csp += " " + value + ";"
			}

			c.Response().Header().Add("Content-Security-Policy", csp)

			return c.Render(
				http.StatusOK,
				"layout",
				map[string]any{
					"BasePath":    route,
					"Title":       args.Manifest.Title,
					"Description": args.Manifest.Description,
					"Head":        loadFile(paths.Views.Head, data),
					"Body":        loadFile(paths.Views.Body, data),
					"Footer":      loadFile(paths.Views.Footer, data),
				},
			)
		},
	)
}

func loadFile(path string, data map[string]string) template.HTML {
	if !utils.FileExists(path) {
		return ""
	}

	tmpl, err := template.ParseFiles(path)
	if err != nil {
		return ""
	}

	var buf bytes.Buffer

	err = tmpl.Execute(&buf, data)
	if err != nil {
		return ""
	}

	return template.HTML(buf.String())
}
