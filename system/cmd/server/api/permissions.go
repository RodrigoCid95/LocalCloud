package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"net/http"

	"github.com/labstack/echo/v4"
)

func filterPermission(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		permissionRaw := c.Param("permission")
		permission, ok := core.NormalizePermissionName(permissionRaw)

		if !ok {
			return c.NoContent(http.StatusNotFound)
		}

		c.Set("permission", permission)

		return next(c)
	}
}

func RegisterPermissionsAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/:package_name", func(c echo.Context) error {
		packageNameRaw := c.Param("package_name")

		if ok := modules.AppsManager.IsInstalled(packageNameRaw, false); !ok {
			return c.NoContent(http.StatusNotFound)
		}

		data := modules.Permissions.Get(packageNameRaw)

		return c.JSON(http.StatusOK, data)
	}, validityPermission(mpm, packageMame, core.PERMISSIONS_GET))

	gAPI.GET("/:package_name/:permission", func(c echo.Context) error {
		permission := c.Get("permission").(string)

		var permissionResult *types.Permission
		results := modules.Permissions.Get(permission)
		for _, result := range results {
			if result.Name == permission {
				permissionResult = &result
			}
		}

		if permissionResult == nil {
			return c.NoContent(http.StatusNotFound)
		}

		return c.JSON(http.StatusOK, permissionResult)
	}, validityPermission(mpm, packageMame, core.PERMISSIONS_GET), validityPackageName(modules), filterPermission)

	gAPI.PUT("/:package_name/:permission/enable", func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		permission := c.Get("permission").(string)

		modules.Permissions.Put(packageName, permission, true)
		mpm.Update(packageName, permission, true)

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.PERMISSIONS_ENABLE), validityPackageName(modules), verifyAutoManagment, filterPermission)

	gAPI.PUT("/:package_name/:permission/disable", func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		permission := c.Get("permission").(string)

		modules.Permissions.Put(packageName, permission, false)
		mpm.Update(packageName, permission, false)

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.PERMISSIONS_DISABLE), validityPackageName(modules), verifyAutoManagment, filterPermission)
}
