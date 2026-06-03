package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"net/http"
	"slices"
	"strconv"

	"github.com/labstack/echo/v4"
)

func validitySource(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sType := c.Param("source_type")
		if !slices.Contains(core.SourceTypesAllowed, sType) {
			return c.NoContent(http.StatusNotFound)
		}

		c.Set("source_type", sType)

		return next(c)
	}
}

func validitySourceId(modules *modules.List) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			packageName := c.Get("package_name").(string)
			sType := c.Get("source_type").(string)
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				return c.NoContent(http.StatusNotFound)
			}
			results := modules.Sources.Get(packageName, sType)

			for _, result := range results {
				if result.Id == id {
					c.Set("source", result)

					return next(c)
				}
			}

			return c.NoContent(http.StatusNotFound)
		}
	}
}

func RegisterSourcesAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager, msm *managers.MemorySourcesManager) {
	gAPI.GET("/:package_name", func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		results := modules.Sources.GetAll(packageName)

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageMame, core.SOURCES_GET), validityPackageName(modules))

	gAPI.GET("/:package_name/:source_type", func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		sType := c.Get("source_type").(string)
		results := modules.Sources.Get(packageName, sType)

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageMame, core.SOURCES_GET), validityPackageName(modules), validitySource)

	gAPI.GET("/:package_name/:source_type/:id", func(c echo.Context) error {
		source := c.Get("source").(types.Source)

		return c.JSON(http.StatusOK, source)
	}, validityPermission(mpm, packageMame, core.SOURCES_GET), validityPackageName(modules), validitySource, validitySourceId(modules))

	gAPI.PUT("/:package_name/:source_type/:id/enable", func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		sType := c.Get("source_type").(string)
		source := c.Get("source").(types.Source)
		modules.Sources.Put(packageName, sType, source.Id, true)
		msm.Update(packageName, sType, source.Id, true)

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.SOURCES_ENABLE), validityPackageName(modules), verifyAutoManagment, validitySource, validitySourceId(modules))

	gAPI.PUT("/:package_name/:source_type/:id/disable", func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		sType := c.Get("source_type").(string)
		source := c.Get("source").(types.Source)
		modules.Sources.Put(packageName, sType, source.Id, false)
		msm.Update(packageName, sType, source.Id, false)

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.SOURCES_DISABLE), validityPackageName(modules), verifyAutoManagment, validitySource, validitySourceId(modules))
}
