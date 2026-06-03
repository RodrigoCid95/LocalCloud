package main

import (
	"crypto/rand"
	"encoding/gob"
	"localcloud/cmd/server/api"
	"localcloud/cmd/server/app"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/utils"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type serverConfig struct {
	SessionKey []byte
}

func main() {
	gob.Register([]string{})
	sessionKey := loadSessionKey()

	modules := &modules.List{
		AppData:       &core.AppData{},
		AppStore:      &core.AppStore{},
		AppBus:        &core.AppBus{},
		Notifications: &core.Notifications{},
		AppsManager:   &core.AppsManager{},
		Assignments:   &core.Assignments{},
		FileSystem:    &core.FileSystem{},
		GroupManager:  &core.GroupManager{},
		Permissions:   &core.Permissions{},
		SambaManager:  &core.SambaManager{},
		SystemPower:   &core.SystemPower{},
		Sources:       &core.Sources{},
		SystemStatus:  &core.SystemStatus{},
		UsersManager:  &core.UsersManager{},
		Encrypt:       &utils.Encrypt{},
	}

	systemAppList := modules.AppsManager.GetAll(true)
	appList := modules.AppsManager.GetAll(false)

	go func() {
		e := echo.New()
		e.Any("/*", func(c echo.Context) error {
			req := c.Request()
			host := req.Host
			return c.Redirect(http.StatusMovedPermanently, "https://"+host+req.RequestURI)
		})

		if err := e.Start(":80"); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal(err)
		}
	}()

	e := echo.New()
	e.Use(session.Middleware(sessions.NewCookieStore(sessionKey)))
	e.Renderer = app.NewRenderer()

	mpm := managers.NewMemoryPermissionsManager()
	msm := managers.NewMemorySourcesManager()
	am := managers.NewAssignmentsManager(modules)

	api.RegisterAuthAPI(e, modules, am)

	for _, manifest := range systemAppList {
		app.Register(app.RegisterArgs{
			E:           e,
			Manifest:    &manifest,
			Modules:     modules,
			IsSystemApp: true,
			Mpm:         mpm,
			Msm:         msm,
			Am:          am,
		})
	}

	for _, manifest := range appList {
		app.Register(app.RegisterArgs{
			E:           e,
			Manifest:    &manifest,
			Modules:     modules,
			IsSystemApp: false,
			Mpm:         mpm,
			Msm:         msm,
			Am:          am,
		})
	}

	e.GET("/", func(c echo.Context) error {
		hasSession := api.HasSession(c, am)
		if !hasSession {
			return c.Redirect(http.StatusFound, "/login")
		}

		return c.Redirect(http.StatusFound, "/desktop")
	})

	e.Logger.Fatal(e.StartTLS(":443", core.Cert.Cert, core.Cert.Key))
}

func loadSessionKey() []byte {
	sessionSecret := os.Getenv("LOCALCLOUD_SESSION_SECRET")
	if sessionSecret == "" {
		sessionSecret = randomSessionSecret()
		log.Println("[Server] LOCALCLOUD_SESSION_SECRET is not set; generated an in-memory session key")
	} else if len(sessionSecret) < 32 {
		log.Fatal("[Server] LOCALCLOUD_SESSION_SECRET must be set and contain at least 32 characters")
	}

	return []byte("sessionSecret")
}

func envOrDefault(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

func randomSessionSecret() string {
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		log.Fatalf("[Server] Could not generate session key: %v", err)
	}

	return string(secret)
}
