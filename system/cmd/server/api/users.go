package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"net/http"
	"slices"
	"strconv"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type ResetPasswordArgs struct {
	Uid      int    `json:"uid"`
	Password string `json:"password"`
}

func getUidSession(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, err := session.Get(SessionName, c)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		uid := sess.Values[SessionUidKey]
		c.Set("uid", uid)

		return next(c)
	}
}

func RegisterUsersAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.POST("", func(c echo.Context) error {
		var newData types.NewUser
		if err := c.Bind(&newData); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		result, err := modules.UsersManager.Get(newData.Name)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		if result != nil {
			return c.NoContent(http.StatusOK)
		}

		if _, err := modules.UsersManager.Create("lc", newData); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.USERS_CREATE))

	gAPI.GET("", func(c echo.Context) error {
		uid := c.Get("uid").(int)
		userList, err := modules.GroupManager.GetUsers("lc")
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		results, err := modules.UsersManager.GetAll()
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		users := []types.User{}
		for _, result := range *results {
			if result.Uid != uid && slices.Contains(*userList, result.Name) {
				users = append(users, types.User{
					Uid:      result.Uid,
					Name:     result.Name,
					FullName: result.FullName,
					Email:    result.Email,
					Phone:    result.Phone,
				})
			}
		}

		return c.JSON(http.StatusOK, users)
	}, validityPermission(mpm, packageMame, core.USERS_GET_ALL), getUidSession)

	gAPI.GET("/:uid", func(c echo.Context) error {
		uid := c.Get("uid").(int)
		currentUidRaw := c.Param("uid")
		currentUid, err := strconv.Atoi(currentUidRaw)
		if err != nil {
			return c.NoContent(http.StatusNotFound)
		}

		if currentUid == uid {
			return c.NoContent(http.StatusNotFound)
		}

		result, err := modules.UsersManager.GetByUid(currentUid)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.JSON(http.StatusOK, types.User{
			Uid:      result.Uid,
			Name:     result.Name,
			FullName: result.FullName,
			Email:    result.Email,
			Phone:    result.Phone,
		})
	}, validityPermission(mpm, packageMame, core.USERS_GET), getUidSession)

	gAPI.PUT("/:uid", func(c echo.Context) error {
		var newData types.DataUser
		if err := c.Bind(&newData); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		currentUidRaw := c.Param("uid")
		currentUid, err := strconv.Atoi(currentUidRaw)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		uid := c.Get("uid").(int)
		if uid == currentUid {
			return c.NoContent(http.StatusBadRequest)
		}

		result, err := modules.UsersManager.GetByUid(currentUid)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		if result == nil {
			return c.NoContent(http.StatusOK)
		}

		if err := modules.UsersManager.Update(result.Name, newData); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.USERS_UPDATE), getUidSession)

	gAPI.DELETE("/:uid", func(c echo.Context) error {
		currentUidRaw := c.Param("uid")
		currentUid, err := strconv.Atoi(currentUidRaw)
		if err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		uid := c.Get("uid").(int)
		if uid == currentUid {
			return c.NoContent(http.StatusBadRequest)
		}

		result, err := modules.UsersManager.GetByUid(currentUid)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		if result == nil {
			return c.NoContent(http.StatusOK)
		}

		if modules.SambaManager.BelongsTo(result.Name) {
			modules.SambaManager.Delete(result.Name)
		}

		if err := modules.UsersManager.Delete(currentUid); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.USERS_DELETE), getUidSession)

	gAPI.PUT("/set-password", func(c echo.Context) error {
		var newData ResetPasswordArgs
		if err := c.Bind(&newData); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}

		uid := c.Get("uid").(int)
		if uid == newData.Uid {
			return c.NoContent(http.StatusBadRequest)
		}

		result, err := modules.UsersManager.GetByUid(newData.Uid)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		if result == nil {
			return c.NoContent(http.StatusOK)
		}

		if err := modules.UsersManager.SetPassword(result.Name, newData.Password); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.USERS_SET_PASSWORD), getUidSession)
}
