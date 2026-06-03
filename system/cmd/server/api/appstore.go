package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type appStoreInsertResult struct {
	ID string `json:"id"`
}

func RegisterAppStoreAPI(gAPI *echo.Group, packageName managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/global", func(c echo.Context) error {
		results, err := modules.AppStore.ListGlobalCollections(packageName)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageName, core.APP_STORE_READ))

	gAPI.GET("/global/:collection", func(c echo.Context) error {
		results, err := modules.AppStore.ListGlobal(packageName, c.Param("collection"), appStoreListOptions(c))
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageName, core.APP_STORE_READ))

	gAPI.POST("/global/:collection", func(c echo.Context) error {
		value, err := readJSONBody(c)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		id, err := modules.AppStore.InsertGlobal(packageName, c.Param("collection"), value)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.JSON(http.StatusCreated, appStoreInsertResult{ID: id})
	}, validityPermission(mpm, packageName, core.APP_STORE_WRITE))

	gAPI.POST("/global/:collection/_compact", func(c echo.Context) error {
		if err := modules.AppStore.CompactGlobal(packageName, c.Param("collection")); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageName, core.APP_STORE_COMPACT))

	gAPI.GET("/global/:collection/:id", func(c echo.Context) error {
		doc, err := modules.AppStore.GetGlobal(packageName, c.Param("collection"), c.Param("id"))
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		if doc == nil {
			return c.NoContent(http.StatusNotFound)
		}

		return c.JSON(http.StatusOK, doc)
	}, validityPermission(mpm, packageName, core.APP_STORE_READ))

	gAPI.PUT("/global/:collection/:id", func(c echo.Context) error {
		value, err := readJSONBody(c)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.AppStore.PutGlobal(packageName, c.Param("collection"), c.Param("id"), value); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageName, core.APP_STORE_WRITE))

	gAPI.DELETE("/global/:collection/:id", func(c echo.Context) error {
		if err := modules.AppStore.DeleteGlobal(packageName, c.Param("collection"), c.Param("id")); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageName, core.APP_STORE_DELETE))

	gAPI.GET("/user", func(c echo.Context) error {
		username := c.Get("username").(string)
		results, err := modules.AppStore.ListUserCollections(packageName, username)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageName, core.APP_STORE_READ), getUidSession, appDataUser(modules))

	gAPI.GET("/user/:collection", func(c echo.Context) error {
		username := c.Get("username").(string)
		results, err := modules.AppStore.ListUser(packageName, username, c.Param("collection"), appStoreListOptions(c))
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageName, core.APP_STORE_READ), getUidSession, appDataUser(modules))

	gAPI.POST("/user/:collection", func(c echo.Context) error {
		username := c.Get("username").(string)
		value, err := readJSONBody(c)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		id, err := modules.AppStore.InsertUser(packageName, username, c.Param("collection"), value)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.JSON(http.StatusCreated, appStoreInsertResult{ID: id})
	}, validityPermission(mpm, packageName, core.APP_STORE_WRITE), getUidSession, appDataUser(modules))

	gAPI.POST("/user/:collection/_compact", func(c echo.Context) error {
		username := c.Get("username").(string)
		if err := modules.AppStore.CompactUser(packageName, username, c.Param("collection")); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageName, core.APP_STORE_COMPACT), getUidSession, appDataUser(modules))

	gAPI.GET("/user/:collection/:id", func(c echo.Context) error {
		username := c.Get("username").(string)
		doc, err := modules.AppStore.GetUser(packageName, username, c.Param("collection"), c.Param("id"))
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		if doc == nil {
			return c.NoContent(http.StatusNotFound)
		}

		return c.JSON(http.StatusOK, doc)
	}, validityPermission(mpm, packageName, core.APP_STORE_READ), getUidSession, appDataUser(modules))

	gAPI.PUT("/user/:collection/:id", func(c echo.Context) error {
		username := c.Get("username").(string)
		value, err := readJSONBody(c)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.AppStore.PutUser(packageName, username, c.Param("collection"), c.Param("id"), value); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageName, core.APP_STORE_WRITE), getUidSession, appDataUser(modules))

	gAPI.DELETE("/user/:collection/:id", func(c echo.Context) error {
		username := c.Get("username").(string)
		if err := modules.AppStore.DeleteUser(packageName, username, c.Param("collection"), c.Param("id")); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageName, core.APP_STORE_DELETE), getUidSession, appDataUser(modules))
}

func appStoreListOptions(c echo.Context) core.AppStoreListOptions {
	offset, _ := strconv.Atoi(c.QueryParam("offset"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	desc, _ := strconv.ParseBool(c.QueryParam("desc"))

	return core.AppStoreListOptions{
		Offset: offset,
		Limit:  limit,
		Desc:   desc,
	}
}
