package api

import (
	"encoding/json"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
)

const appBusMaxMessageBytes = 64 * 1024

func RegisterAppBusAPI(gAPI *echo.Group, packageName managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/ws", func(c echo.Context) error {
		uid := c.Get("uid").(int)
		scope := c.QueryParam("scope")
		room := c.QueryParam("room")
		instanceId := c.QueryParam("instanceId")

		if scope == "" {
			scope = core.AppBusScopeUser
		}
		if room == "" {
			room = "default"
		}
		if scope == core.AppBusScopeShared && !mpm.Check(packageName, core.APP_BUS_SHARED) {
			return c.NoContent(http.StatusUnauthorized)
		}

		handler := websocket.Handler(func(ws *websocket.Conn) {
			ws.MaxPayloadBytes = appBusMaxMessageBytes

			client, err := modules.AppBus.Subscribe(packageName, scope, room, uid, instanceId)
			if err != nil {
				_ = ws.Close()
				return
			}
			defer modules.AppBus.Unsubscribe(client)

			done := make(chan struct{})
			defer close(done)

			go func() {
				for {
					select {
					case <-done:
						return
					case event, ok := <-client.Events:
						if !ok {
							return
						}
						if err := websocket.JSON.Send(ws, event); err != nil {
							_ = ws.Close()
							return
						}
					}
				}
			}()

			for {
				var message core.AppBusMessage
				if err := websocket.JSON.Receive(ws, &message); err != nil {
					return
				}
				if message.Payload == nil {
					message.Payload = json.RawMessage("null")
				}
				if err := modules.AppBus.Publish(client, message); err != nil {
					return
				}
			}
		})

		handler.ServeHTTP(c.Response(), c.Request())
		return nil
	}, validityPermission(mpm, packageName, core.APP_BUS_CONNECT), getUidSession)
}
