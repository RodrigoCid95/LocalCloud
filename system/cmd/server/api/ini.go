package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/types"
	"net/http"

	"github.com/labstack/echo/v4"
)

type RegisterAPIArgs struct {
	GAPI     *echo.Group
	Manifest *types.AppResult
	Modules  *modules.List
	Mpm      *managers.MemoryPermissionsManager
	Msm      *managers.MemorySourcesManager
	Am       *managers.AssignmentsManager
}

func RegisterAPI(args RegisterAPIArgs) {
	RegisterAppsAPI(
		args.GAPI.Group("/apps"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterAppDataAPI(
		args.GAPI.Group("/data"),
		args.Manifest.PackageName,
		args.Modules,
	)
	RegisterAppStoreAPI(
		args.GAPI.Group("/store"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterAppBusAPI(
		args.GAPI.Group("/bus"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterNotificationsAPI(
		args.GAPI.Group("/notifications"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterPermissionsAPI(
		args.GAPI.Group("/permissions"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterProfileAPI(
		args.GAPI.Group("/profile"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterSourcesAPI(
		args.GAPI.Group("/sources"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
		args.Msm,
	)
	RegisterUsersAPI(
		args.GAPI.Group("/users"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterAssignmentsAPI(
		args.GAPI.Group("/assignments"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
		args.Am,
	)
	RegisterFileSystemAPI(
		args.GAPI.Group("/filesystem"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterSambaAPI(
		args.GAPI.Group("/samba"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
	RegisterSystemAPI(
		args.GAPI.Group("/system"),
		args.Manifest.PackageName,
		args.Modules,
		args.Mpm,
	)
}

func validityPermission(mpm *managers.MemoryPermissionsManager, packageName managers.PackageName, permission managers.Permission) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !mpm.Check(packageName, permission) {
				return c.NoContent(http.StatusUnauthorized)
			}

			return next(c)
		}
	}
}
