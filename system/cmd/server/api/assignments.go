package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func validityUid(modules *modules.List) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			uid := c.Get("uid").(int)
			paramUidRaw := c.Param("uid")
			paramUid, err := strconv.Atoi(paramUidRaw)
			if err != nil {
				return c.NoContent(http.StatusNotFound)
			}

			if paramUid == uid {
				return c.NoContent(http.StatusNotFound)
			}

			result, err := modules.UsersManager.GetByUid(paramUid)
			if err != nil {
				return c.NoContent(http.StatusInternalServerError)
			}

			if result == nil {
				return c.NoContent(http.StatusNotFound)
			}

			c.Set("param_uid", paramUid)
			c.Set("user_name", result.Name)

			return next(c)
		}
	}
}

func RegisterAssignmentsAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager, am *managers.AssignmentsManager) {
	gAPI.GET("/:uid", func(c echo.Context) error {
		paramUid := c.Get("param_uid").(int)

		results := modules.AppsManager.GetByUid(paramUid)
		apps := []types.App{}
		for _, result := range results {
			apps = append(apps, types.App{
				PackageName: result.PackageName,
				Title:       result.Title,
				Description: result.Description,
				Author:      result.Author,
				Extentions:  result.Extentions,
			})
		}

		return c.JSON(http.StatusOK, apps)
	}, validityPermission(mpm, packageMame, core.ASSIGNMENTS_GET), getUidSession, validityUid(modules))

	gAPI.PUT("/:uid/:package_name", func(c echo.Context) error {
		paramUid := c.Get("param_uid").(int)
		packageName := c.Get("package_name").(string)

		modules.Assignments.Add(paramUid, packageName)
		am.Add(paramUid, packageName)

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.ASSIGNMENTS_ADD), getUidSession, validityUid(modules), validityPackageName(modules))

	gAPI.DELETE("/:uid/:package_name", func(c echo.Context) error {
		paramUid := c.Get("param_uid").(int)
		packageName := c.Get("package_name").(string)

		modules.Assignments.Remove(paramUid, packageName)
		am.Remove(paramUid, packageName)

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.ASSIGNMENTS_REMOVE), getUidSession, validityUid(modules), validityPackageName(modules))
}
