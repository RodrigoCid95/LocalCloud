package api

import (
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

type createDirData struct {
	Path string `json:"path"`
}

type renameData struct {
	Path    string `json:"path"`
	NewName string `json:"newName"`
}

func fileSystemRoot(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		root := core.FileSystemRoot(c.Param("root"))
		switch root {
		case core.FileSystemRootShared, core.FileSystemRootUser:
			c.Set("filesystem_root", root)
			return next(c)
		default:
			return c.NoContent(http.StatusNotFound)
		}
	}
}

func fileSystemUser(modules *modules.List) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			uid := c.Get("uid").(int)
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

func appSupportsExtension(app types.AppResult, extension string) bool {
	extension = strings.TrimPrefix(strings.ToLower(extension), ".")
	if extension == "" {
		return false
	}

	for _, appExtension := range app.Extentions {
		if strings.TrimPrefix(strings.ToLower(appExtension), ".") == extension {
			return true
		}
	}

	return false
}

func getSystemAppFileRedirect(modules *modules.List, root core.FileSystemRoot, path string) string {
	extension := filepath.Ext(path)
	if extension == "" {
		return ""
	}

	for _, systemApp := range modules.AppsManager.GetAll(true) {
		if !appSupportsExtension(systemApp, extension) {
			continue
		}

		appURL := url.URL{Path: "/" + systemApp.PackageName}
		query := appURL.Query()
		query.Set("root", string(root))
		query.Set("path", path)
		appURL.RawQuery = query.Encode()
		return appURL.String()
	}

	return ""
}

func serveInlineFile(c echo.Context, path string, file *os.File, modTime time.Time) {
	if contentType := mime.TypeByExtension(filepath.Ext(path)); contentType != "" {
		c.Response().Header().Set(echo.HeaderContentType, contentType)
	}
	c.Response().Header().Set(echo.HeaderContentDisposition, mime.FormatMediaType("inline", map[string]string{
		"filename": filepath.Base(path),
	}))
	http.ServeContent(c.Response(), c.Request(), filepath.Base(path), modTime, file)
}

func RegisterFileSystemAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("/:root/dir", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)
		path := c.QueryParam("path")

		results, err := modules.FileSystem.ReadDir(root, username, path)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.JSON(http.StatusOK, results)
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_READ_DIR), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.GET("/:root/file", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)
		path := c.QueryParam("path")
		if path == "" {
			return c.NoContent(http.StatusBadRequest)
		}

		file, err := modules.FileSystem.OpenFile(root, username, path)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}
		defer file.Close()

		info, err := file.Stat()
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}
		if info.IsDir() {
			return c.NoContent(http.StatusBadRequest)
		}

		c.Response().Header().Set(echo.HeaderContentType, "application/octet-stream")
		c.Response().Header().Set(echo.HeaderContentDisposition, mime.FormatMediaType("attachment", map[string]string{
			"filename": filepath.Base(path),
		}))
		http.ServeContent(c.Response(), c.Request(), filepath.Base(path), info.ModTime(), file)
		return nil
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_READ_FILE), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.GET("/:root/open", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)
		path := c.QueryParam("path")
		if path == "" {
			return c.NoContent(http.StatusBadRequest)
		}

		file, err := modules.FileSystem.OpenFile(root, username, path)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}
		defer file.Close()

		info, err := file.Stat()
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}
		if info.IsDir() {
			return c.NoContent(http.StatusBadRequest)
		}

		if redirectURL := getSystemAppFileRedirect(modules, root, path); redirectURL != "" {
			return c.Redirect(http.StatusFound, redirectURL)
		}

		serveInlineFile(c, path, file, info.ModTime())
		return nil
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_READ_FILE), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.GET("/:root/stream", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)
		path := c.QueryParam("path")
		if path == "" {
			return c.NoContent(http.StatusBadRequest)
		}

		file, err := modules.FileSystem.OpenFile(root, username, path)
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}
		defer file.Close()

		info, err := file.Stat()
		if err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}
		if info.IsDir() {
			return c.NoContent(http.StatusBadRequest)
		}

		serveInlineFile(c, path, file, info.ModTime())
		return nil
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_READ_FILE), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.POST("/:root/dir", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)

		var data createDirData
		if err := c.Bind(&data); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		if data.Path == "" {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.FileSystem.CreateDir(root, username, data.Path); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_CREATE_DIR), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.PUT("/:root/file", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)
		path := c.QueryParam("path")
		if path == "" || filepath.Base(path) == "." {
			return c.NoContent(http.StatusBadRequest)
		}

		if _, err := modules.FileSystem.WriteFile(root, username, path, c.Request().Body); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_WRITE_FILE), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.DELETE("/:root", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)
		path := c.QueryParam("path")
		if path == "" || filepath.Base(path) == "." {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.FileSystem.Delete(root, username, path); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_DELETE), getUidSession, fileSystemUser(modules), fileSystemRoot)

	gAPI.PUT("/:root/rename", func(c echo.Context) error {
		root := c.Get("filesystem_root").(core.FileSystemRoot)
		username := c.Get("username").(string)

		var data renameData
		if err := c.Bind(&data); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		if data.Path == "" || filepath.Base(data.Path) == "." || data.NewName == "" || filepath.Base(data.NewName) != data.NewName {
			return c.NoContent(http.StatusBadRequest)
		}

		if err := modules.FileSystem.Rename(root, username, data.Path, data.NewName); err != nil {
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.FILESYSTEM_RENAME), getUidSession, fileSystemUser(modules), fileSystemRoot)
}
