package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"log"
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type LoginRequest struct {
	UserName string `json:"user_name"`
	Password string `json:"password"`
}

func RegisterAuthAPI(e *echo.Echo, modules *modules.List, am *managers.AssignmentsManager) {
	e.POST(
		"/auth",
		func(c echo.Context) error {
			var data LoginRequest
			if err := c.Bind(&data); err != nil {
				return c.NoContent(http.StatusBadRequest)
			}

			if data.UserName == "" || data.Password == "" {
				return c.NoContent(http.StatusBadRequest)
			}

			result, err := modules.UsersManager.Get(data.UserName)
			if err != nil || result == nil {
				return c.NoContent(http.StatusUnauthorized)
			}

			ok, err := modules.Encrypt.VerifyHash(data.Password, result.PasswordHash)
			if err != nil {
				log.Printf("[Server] Password verification failed for %s: %v\n", data.UserName, err)
				return c.NoContent(http.StatusUnauthorized)
			}
			if !ok {
				return c.NoContent(http.StatusUnauthorized)
			}

			appList := modules.AppsManager.GetByUid(result.Uid)
			apps := []string{}
			for _, a := range appList {
				apps = append(apps, a.PackageName)
			}

			sess, err := session.Get(SessionName, c)
			if err != nil {
				log.Printf("[Server] Could not get session: %v\n", err)
				return c.NoContent(http.StatusInternalServerError)
			}
			sess.Options = &sessions.Options{
				Path:     "/",
				MaxAge:   86400 * 7,
				HttpOnly: true,
				Secure:   true,
				SameSite: http.SameSiteLaxMode,
			}
			sess.Values[SessionUidKey] = result.Uid
			if err := sess.Save(c.Request(), c.Response()); err != nil {
				log.Printf("[Server] Could not save session: %v\n", err)
				return c.NoContent(http.StatusInternalServerError)
			}

			return c.NoContent(http.StatusOK)
		},
		func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				if HasSession(c, am) {
					return c.NoContent(http.StatusOK)
				}

				return next(c)
			}
		},
	)

	e.DELETE(
		"/auth",
		func(c echo.Context) error {
			sess, err := session.Get(SessionName, c)
			if err != nil {
				log.Printf("[Server] Could not get session for logout: %v\n", err)
				return c.NoContent(http.StatusInternalServerError)
			}
			sess.Options.MaxAge = -1

			for k := range sess.Values {
				delete(sess.Values, k)
			}

			if err := sess.Save(c.Request(), c.Response()); err != nil {
				log.Printf("[Server] Could not clear session: %v\n", err)
				return c.NoContent(http.StatusInternalServerError)
			}

			return c.NoContent(http.StatusOK)
		},
		func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				if HasSession(c, am) {
					return next(c)
				}

				return c.NoContent(http.StatusOK)
			}
		},
	)
}
