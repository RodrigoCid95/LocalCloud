package api

import (
	"encoding/json"
	"io"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"net/http"

	"github.com/labstack/echo/v4"
)

func RegisterAppDataAPI(gAPI *echo.Group, packageName managers.PackageName, modules *modules.List) {
	gAPI.GET("/global", func(c echo.Context) error {
		results, err := modules.AppData.ListGlobal(packageName)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.JSON(http.StatusOK, results)
	})

	gAPI.GET("/global/:key", func(c echo.Context) error {
		value, err := modules.AppData.GetGlobal(packageName, c.Param("key"))
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		if value == nil {
			return c.NoContent(http.StatusNotFound)
		}

		return c.Blob(http.StatusOK, echo.MIMEApplicationJSON, value)
	})

	gAPI.PUT("/global/:key", func(c echo.Context) error {
		value, err := readJSONBody(c)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.AppData.SetGlobal(packageName, c.Param("key"), value); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	})

	gAPI.DELETE("/global/:key", func(c echo.Context) error {
		if err := modules.AppData.DeleteGlobal(packageName, c.Param("key")); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	})

	gAPI.GET("/user", func(c echo.Context) error {
		username := c.Get("username").(string)
		results, err := modules.AppData.ListUser(packageName, username)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.JSON(http.StatusOK, results)
	}, getUidSession, appDataUser(modules))

	gAPI.GET("/user/:key", func(c echo.Context) error {
		username := c.Get("username").(string)
		value, err := modules.AppData.GetUser(packageName, username, c.Param("key"))
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		if value == nil {
			return c.NoContent(http.StatusNotFound)
		}

		return c.Blob(http.StatusOK, echo.MIMEApplicationJSON, value)
	}, getUidSession, appDataUser(modules))

	gAPI.PUT("/user/:key", func(c echo.Context) error {
		username := c.Get("username").(string)
		value, err := readJSONBody(c)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.AppData.SetUser(packageName, username, c.Param("key"), value); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, getUidSession, appDataUser(modules))

	gAPI.DELETE("/user/:key", func(c echo.Context) error {
		username := c.Get("username").(string)
		if err := modules.AppData.DeleteUser(packageName, username, c.Param("key")); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, getUidSession, appDataUser(modules))
}

func appDataUser(modules *modules.List) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			uid, ok := c.Get("uid").(int)
			if !ok {
				return c.NoContent(http.StatusUnauthorized)
			}

			user, err := modules.UsersManager.GetByUid(uid)
			if err != nil {
				return c.NoContent(http.StatusInternalServerError)
			}
			if user == nil {
				return c.NoContent(http.StatusUnauthorized)
			}

			c.Set("username", user.Name)
			return next(c)
		}
	}
}

func readJSONBody(c echo.Context) (json.RawMessage, error) {
	defer c.Request().Body.Close()

	content, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return nil, err
	}
	if !json.Valid(content) {
		return nil, echo.NewHTTPError(http.StatusBadRequest)
	}

	return json.RawMessage(content), nil
}
