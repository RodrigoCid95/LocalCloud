package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"net/http"

	"github.com/labstack/echo/v4"
)

func verifyUserAutoManagment(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		uidParam := c.Get("param_uid").(int)
		uid := c.Get("uid").(int)

		if uidParam == uid {
			return c.NoContent(http.StatusUnauthorized)
		}

		return next(c)
	}
}

func RegisterSambaAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/:uid", func(c echo.Context) error {
		name := c.Get("user_name").(string)
		has := modules.SambaManager.BelongsTo(name)

		return c.JSON(http.StatusOK, has)
	}, validityPermission(mpm, packageMame, core.SAMBA_BELONGS_TO), getUidSession, validityUid(modules), verifyUserAutoManagment)

	gAPI.POST("/:uid/enable", func(c echo.Context) error {
		name := c.Get("user_name").(string)
		if modules.SambaManager.BelongsTo(name) {
			return c.NoContent(http.StatusOK)
		}

		if err := modules.SambaManager.Put(name, ""); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.SAMBA_ENABLE), getUidSession, validityUid(modules), verifyUserAutoManagment)

	gAPI.POST("/:uid/disable", func(c echo.Context) error {
		name := c.Get("user_name").(string)
		if !modules.SambaManager.BelongsTo(name) {
			return c.NoContent(http.StatusOK)
		}

		if err := modules.SambaManager.Delete(name); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.SAMBA_DISABLE), getUidSession, validityUid(modules), verifyUserAutoManagment)

	gAPI.PUT("/:uid/set-password", func(c echo.Context) error {
		var data SetPasswordData
		if err := c.Bind(&data); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		name := c.Get("user_name").(string)
		if err := modules.SambaManager.SetPassword(name, data.Password); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.SAMBA_SET_PASSWORD), getUidSession, validityUid(modules), verifyUserAutoManagment)
}
