package api

import (
	"fmt"
	"io"
	"localcloud/cmd/server/managers"
	"localcloud/cmd/server/modules"
	"localcloud/core"
	"localcloud/types"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/labstack/echo/v4"
)

func validityPackageName(modules *modules.List) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			packageNameRaw := c.Param("package_name")

			if err := core.ValidatePackageName(packageNameRaw); err != nil {
				return c.NoContent(http.StatusNotFound)
			}

			if ok := modules.AppsManager.IsInstalled(packageNameRaw, false); !ok {
				return c.NoContent(http.StatusNotFound)
			}

			c.Set("package_name", packageNameRaw)
			return next(c)
		}
	}
}

func RegisterAppsAPI(gAPI *echo.Group, packageMame managers.PackageName, modules *modules.List, mpm *managers.MemoryPermissionsManager) {
	gAPI.GET("", func(c echo.Context) error {
		results := modules.AppsManager.GetAll(false)

		data := []types.App{}
		for _, result := range results {
			data = append(data, types.App{
				PackageName: result.PackageName,
				Title:       result.Title,
				Description: result.Description,
				Author:      result.Author,
				Extentions:  result.Extentions,
			})
		}

		return c.JSON(http.StatusOK, data)
	}, validityPermission(mpm, packageMame, core.APPS_GET_ALL))

	gAPI.GET("/:package_name", func(c echo.Context) error {
		packageName := c.Param("package_name")
		result := modules.AppsManager.GetByPackageName(packageName, false)

		if result == nil {
			return c.JSON(http.StatusNotFound, nil)
		}

		data := types.App{
			PackageName: result.PackageName,
			Title:       result.Title,
			Description: result.Description,
			Author:      result.Author,
			Extentions:  result.Extentions,
		}

		return c.JSON(http.StatusOK, data)
	}, validityPermission(mpm, packageMame, core.APPS_GET), validityPackageName(modules))

	gAPI.PUT("/:package_name", func(c echo.Context) error {
		packageName := c.Param("package_name")
		if err := core.ValidatePackageName(packageName); err != nil {
			return c.NoContent(http.StatusNotFound)
		}

		isSystemApp, err := boolParam(c, "system")
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"message": "El parametro system debe ser booleano.",
			})
		}

		if !modules.AppsManager.IsInstalled(packageName, isSystemApp) {
			return c.NoContent(http.StatusNotFound)
		}

		file, err := c.FormFile("file")
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"message": "El formulario debe incluir el archivo en el campo file.",
			})
		}

		path, cleanup, err := saveUploadedAppFile(file)
		if err != nil {
			return err
		}
		defer cleanup()

		if err := modules.AppsManager.Update(path, packageName, isSystemApp); err != nil {
			return err
		}

		manifest := modules.AppsManager.GetByPackageName(packageName, isSystemApp)
		if manifest != nil {
			mpm.RegisterApp(manifest)
		}

		return c.NoContent(http.StatusOK)
	}, validityPermission(mpm, packageMame, core.APPS_UPDATE))
}

func boolParam(c echo.Context, name string) (bool, error) {
	value := c.QueryParam(name)
	if value == "" {
		value = c.FormValue(name)
	}
	if value == "" {
		return false, nil
	}

	result, err := strconv.ParseBool(value)
	if err != nil {
		return false, err
	}

	return result, nil
}

func saveUploadedAppFile(file *multipart.FileHeader) (string, func(), error) {
	src, err := file.Open()
	if err != nil {
		return "", nil, err
	}
	defer src.Close()

	tempDir, err := os.MkdirTemp("", "lc-api-app-update-*")
	if err != nil {
		return "", nil, err
	}
	cleanup := func() {
		_ = os.RemoveAll(tempDir)
	}

	fileName := filepath.Base(file.Filename)
	if fileName == "." || fileName == string(os.PathSeparator) {
		cleanup()
		return "", nil, fmt.Errorf("nombre de archivo invalido: %q", file.Filename)
	}
	path := filepath.Join(tempDir, fileName)

	dst, err := os.Create(path)
	if err != nil {
		cleanup()
		return "", nil, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		cleanup()
		return "", nil, err
	}

	return path, cleanup, nil
}
