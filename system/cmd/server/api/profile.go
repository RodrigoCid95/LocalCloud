package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"net/http"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type SetPasswordData struct {
	Password string `json:"password"`
}

func RegisterProfileAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			sess, _ := session.Get(SessionName, c)
			rawUid := sess.Values[SessionUidKey]
			uid, ok := rawUid.(int)

			if !ok {
				return c.NoContent(400)
			}

			c.Set("uid", uid)
			return next(c)
		}
	})

	gAPI.GET("", func(c echo.Context) error {
		rawUid := c.Get("uid")
		uid, ok := rawUid.(int)
		if !ok {
			return c.NoContent(500)
		}

		result, err := modules.UsersManager.GetByUid(uid)
		if err != nil {
			return c.NoContent(500)
		}

		return c.JSON(200, types.Profile{
			Uid:            result.Uid,
			Name:           result.Name,
			FullName:       result.FullName,
			Phone:          result.Phone,
			Email:          result.Email,
			BelongsToSamba: modules.SambaManager.BelongsTo(result.Name),
		})
	}, validityPermission(mpm, packageMame, core.PROFILE_GET))

	gAPI.GET("/apps", func(c echo.Context) error {
		rawUid := c.Get("uid")
		uid, ok := rawUid.(int)
		if !ok {
			return c.NoContent(500)
		}

		data := []types.App{}
		results := modules.AppsManager.GetByUid(uid)
		for _, result := range results {
			data = append(data, types.App{
				PackageName: result.PackageName,
				Title:       result.Title,
				Description: result.Description,
				Author:      result.Author,
				Extentions:  result.Extentions,
			})
		}

		return c.JSON(http.StatusOK, data)
	}, validityPermission(mpm, packageMame, core.PROFILE_GET_APPS))

	gAPI.PUT("", func(c echo.Context) error {
		newData := types.DataUser{}
		if err := c.Bind(&newData); err != nil {
			return c.NoContent(403)
		}

		rawUid := c.Get("uid")
		uid, ok := rawUid.(int)
		if !ok {
			return c.NoContent(500)
		}

		result, err := modules.UsersManager.GetByUid(uid)
		if err != nil {
			return c.NoContent(500)
		}

		modules.UsersManager.Update(result.Name, newData)
		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.PROFILE_UPDATE))

	gAPI.PUT("/set-password", func(c echo.Context) error {
		var data SetPasswordData
		if err := c.Bind(&data); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		uid := c.Get("uid").(int)
		user, err := modules.UsersManager.GetByUid(uid)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		if user == nil {
			return c.NoContent(http.StatusOK)
		}

		if err := modules.UsersManager.SetPassword(user.Name, data.Password); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.PROFILE_SET_PASSWORD), getUidSession)

	gAPI.PUT("/samba/set-password", func(c echo.Context) error {
		var data SetPasswordData
		if err := c.Bind(&data); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		uid := c.Get("uid").(int)
		user, err := modules.UsersManager.GetByUid(uid)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		if user == nil {
			return c.NoContent(http.StatusOK)
		}

		if err := modules.SambaManager.SetPassword(user.Name, data.Password); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.PROFILE_SET_SAMBA_PASSWORD), getUidSession)
}
