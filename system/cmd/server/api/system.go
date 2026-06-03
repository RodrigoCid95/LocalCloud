package api

import (
	"encoding/json"
	"fmt"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

func RegisterSystemAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/status", func(c echo.Context) error {
		res := c.Response()
		res.Header().Set(echo.HeaderContentType, "text/event-stream")
		res.Header().Set("Cache-Control", "no-cache")
		res.Header().Set("Connection", "keep-alive")
		res.Header().Set("X-Accel-Buffering", "no")
		res.WriteHeader(http.StatusOK)

		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-c.Request().Context().Done():
				return nil
			default:
				if err := writeSystemStatusEvent(res, modules); err != nil {
					return err
				}
			}

			select {
			case <-c.Request().Context().Done():
				return nil
			case <-ticker.C:
			}
		}
	}, validityPermission(mpm, packageMame, core.SYSTEM_STATUS_GET))

	gAPI.POST("/shutdown", func(c echo.Context) error {
		if err := modules.SystemPower.Shutdown(); err != nil {
			return err
		}

		return c.NoContent(http.StatusAccepted)
	}, validityPermission(mpm, packageMame, core.SYSTEM_SHUTDOWN))

	gAPI.POST("/reboot", func(c echo.Context) error {
		if err := modules.SystemPower.Reboot(); err != nil {
			return err
		}

		return c.NoContent(http.StatusAccepted)
	}, validityPermission(mpm, packageMame, core.SYSTEM_REBOOT))
}

func writeSystemStatusEvent(res *echo.Response, modules *modules.List) error {
	status, err := modules.SystemStatus.Get()
	if err != nil {
		return err
	}

	data, err := json.Marshal(status)
	if err != nil {
		return err
	}

	if _, err := fmt.Fprintf(res, "event: status\ndata: %s\n\n", data); err != nil {
		return err
	}
	res.Flush()

	return nil
}
