package api

import (
	"localcloud/cmd/server/managers"
	"net/http"
	"net/url"
	"path"
	"slices"
	"strings"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

const (
	SessionName   = "localcloud_session"
	SessionUidKey = "uid"
)

func HasSession(c echo.Context, am *managers.AssignmentsManager) bool {
	sess, err := session.Get(SessionName, c)
	if err != nil {
		return false
	}

	_, ok := sess.Values[SessionUidKey]

	return ok
}

func AssignedApps(c echo.Context, am *managers.AssignmentsManager) ([]string, bool) {
	sess, err := session.Get(SessionName, c)
	if err != nil {
		return nil, false
	}

	uid, ok := sess.Values[SessionUidKey]
	if !ok {
		return nil, false
	}

	if apps, ok := stringSlice(am.Get(uid.(int))); ok {
		return apps, true
	}

	return nil, false
}

func HasAssignedApp(c echo.Context, packageName string, am *managers.AssignmentsManager) bool {
	apps, ok := AssignedApps(c, am)
	if !ok {
		return false
	}

	return slices.Contains(apps, packageName)
}

func RequireSession(am *managers.AssignmentsManager) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !HasSession(c, am) {
				return c.Redirect(http.StatusFound, "/")
			}

			return next(c)
		}
	}
}

func RequireAssignedApp(packageName string, am *managers.AssignmentsManager) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !HasSession(c, am) {
				return c.Redirect(http.StatusFound, "/")
			}

			if !HasAssignedApp(c, packageName, am) {
				return c.Redirect(http.StatusFound, "/")
			}

			return next(c)
		}
	}
}

func RedirectAuthenticatedUsers(am *managers.AssignmentsManager) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if HasSession(c, am) {
				return c.Redirect(http.StatusFound, "/")
			}

			return next(c)
		}
	}
}

func stringSlice(value any) ([]string, bool) {
	switch v := value.(type) {
	case []string:
		return v, true
	case []any:
		apps := make([]string, 0, len(v))
		for _, item := range v {
			app, ok := item.(string)
			if !ok {
				return nil, false
			}
			apps = append(apps, app)
		}
		return apps, true
	case nil:
		return nil, false
	default:
		return nil, false
	}
}

func RequireMatchingRefererPath() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			requestBasePath, ok := apiBasePath(c.Request().URL.Path)
			if !ok {
				return c.NoContent(http.StatusForbidden)
			}

			refererPath, ok := refererPath(c.Request().Referer())
			if ok && matchingRefererBasePath(refererPath) == requestBasePath {
				return next(c)
			}

			if isSameOriginWebSocket(c.Request()) {
				return next(c)
			}

			if !ok || matchingRefererBasePath(refererPath) != requestBasePath {
				return c.NoContent(http.StatusForbidden)
			}

			return next(c)
		}
	}
}

func isSameOriginWebSocket(req *http.Request) bool {
	if !strings.EqualFold(req.Header.Get("Upgrade"), "websocket") {
		return false
	}

	origin := req.Header.Get("Origin")
	if origin == "" {
		return false
	}

	originURL, err := url.Parse(origin)
	if err != nil {
		return false
	}

	return strings.EqualFold(originURL.Host, req.Host)
}

func matchingRefererBasePath(refererPath string) string {
	if basePath, ok := apiBasePath(refererPath); ok {
		return basePath
	}

	return refererPath
}

func apiBasePath(requestPath string) (string, bool) {
	cleanRequestPath := cleanURLPath(requestPath)
	apiIndex := strings.LastIndex(cleanRequestPath, "/api")
	if apiIndex == -1 {
		return "", false
	}

	afterAPI := apiIndex + len("/api")
	if afterAPI < len(cleanRequestPath) && cleanRequestPath[afterAPI] != '/' {
		return "", false
	}

	basePath := cleanRequestPath[:apiIndex]
	if basePath == "" {
		basePath = "/"
	}

	return basePath, true
}

func refererPath(referer string) (string, bool) {
	if referer == "" {
		return "", false
	}

	refererURL, err := url.Parse(referer)
	if err != nil {
		return "", false
	}

	return cleanURLPath(refererURL.Path), true
}

func cleanURLPath(value string) string {
	if value == "" {
		return "/"
	}

	return path.Clean("/" + strings.TrimPrefix(value, "/"))
}

func verifyAutoManagment(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		packageName := c.Get("package_name").(string)
		name := c.Get("name").(string)

		if packageName == name {
			return c.NoContent(http.StatusUnauthorized)
		}

		return next(c)
	}
}
