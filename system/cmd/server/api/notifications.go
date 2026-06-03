package api

import (
	"encoding/json"
	"fmt"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

func notificationTargetUid(modules *modules.List) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			uid, err := strconv.Atoi(c.Param("uid"))
			if err != nil {
				return c.NoContent(http.StatusNotFound)
			}

			user, err := modules.UsersManager.GetByUid(uid)
			if err != nil {
				return c.NoContent(http.StatusInternalServerError)
			}
			if user == nil {
				return c.NoContent(http.StatusNotFound)
			}

			c.Set("target_uid", uid)
			return next(c)
		}
	}
}

func RegisterNotificationsAPI(gAPI *echo.Group, packageName managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/stream", func(c echo.Context) error {
		uid := c.Get("uid").(int)

		client, err := modules.Notifications.Subscribe(packageName, uid)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		defer modules.Notifications.Unsubscribe(client)

		res := c.Response()
		res.Header().Set(echo.HeaderContentType, "text/event-stream")
		res.Header().Set("Cache-Control", "no-cache")
		res.Header().Set("Connection", "keep-alive")
		res.Header().Set("X-Accel-Buffering", "no")
		res.WriteHeader(http.StatusOK)

		heartbeat := time.NewTicker(25 * time.Second)
		defer heartbeat.Stop()

		for {
			select {
			case <-c.Request().Context().Done():
				return nil
			case event, ok := <-client.Events:
				if !ok {
					return nil
				}
				if err := writeNotificationEvent(res, event); err != nil {
					return err
				}
			case <-heartbeat.C:
				if _, err := fmt.Fprint(res, "event: ping\ndata: {}\n\n"); err != nil {
					return err
				}
				res.Flush()
			}
		}
	}, validityPermission(mpm, packageName, core.NOTIFICATIONS_STREAM), getUidSession)

	gAPI.POST("", func(c echo.Context) error {
		uid := c.Get("uid").(int)
		event, err := sendNotification(c, modules, packageName, uid)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusAccepted, event)
	}, validityPermission(mpm, packageName, core.NOTIFICATIONS_SEND), getUidSession)

	gAPI.POST("/users/:uid", func(c echo.Context) error {
		uid := c.Get("target_uid").(int)
		event, err := sendNotification(c, modules, packageName, uid)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusAccepted, event)
	}, validityPermission(mpm, packageName, core.NOTIFICATIONS_SEND), notificationTargetUid(modules))
}

func sendNotification(c echo.Context, modules *modules.List, packageName string, uid int) (core.NotificationEvent, error) {
	var message core.NotificationMessage
	if err := c.Bind(&message); err != nil {
		return core.NotificationEvent{}, c.NoContent(http.StatusBadRequest)
	}

	event, err := modules.Notifications.SendToUser(packageName, uid, message)
	if err != nil {
		return core.NotificationEvent{}, c.NoContent(http.StatusBadRequest)
	}

	return event, nil
}

func writeNotificationEvent(res *echo.Response, event core.NotificationEvent) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	if _, err := fmt.Fprintf(res, "event: notification\ndata: %s\n\n", data); err != nil {
		return err
	}
	res.Flush()

	return nil
}
