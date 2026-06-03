package core

import (
	"archive/zip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"localcloud/types"
	"localcloud/utils"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"sync"
)

type originalManifestRecord struct {
	Title       string                       `json:"title"`
	Description string                       `json:"description"`
	Author      string                       `json:"author"`
	Extentions  []string                     `json:"extentions"`
	Permissions map[string]string            `json:"permissions"`
	Sources     map[string]map[string]string `json:"sources"`
}

type appInstaller struct {
	PackageName        string
	Manifest           types.Manifest
	CodePath           string
	HeadTemplatePath   string
	BodyTemplatePath   string
	FooterTemplatePath string
}

type AppsManager struct {
	nginxLock sync.Mutex
}

func (am *AppsManager) GetList(isSystemApps bool) []string {
	appList := []string{}
	path := appsPath
	if isSystemApps {
		path = systemAppsPath
	}
	entries, err := os.ReadDir(path)
	if err != nil {
		return appList
	}

	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() {
			appList = append(appList, name)
		}
	}

	return appList
}

func (am *AppsManager) nameToResult(packageName string, isSystemApp bool) *types.AppResult {
	if err := ValidatePackageName(packageName); err != nil {
		return nil
	}
	manifest := readManifest(packageName, isSystemApp)
	if manifest == nil {
		return nil
	}
	extentions := []string{}
	if manifest.Extentions != nil {
		extentions = manifest.Extentions
	}
	permissions := map[string]types.PermissionResult{}
	if manifest.Permissions != nil {
		permissions = manifest.Permissions
	}
	sources := map[string][]types.Source{}
	if manifest.Sources != nil {
		sources = manifest.Sources
	}
	installationPath := filepath.Join(appsPath, packageName)
	if isSystemApp {
		installationPath = filepath.Join(systemAppsPath, packageName)
	}
	return &types.AppResult{
		PackageName:      packageName,
		Title:            manifest.Title,
		Description:      manifest.Description,
		Author:           manifest.Author,
		Extentions:       extentions,
		Permissions:      permissions,
		Sources:          sources,
		InstallationPath: installationPath,
	}
}

func (am *AppsManager) namesToList(packageNames []string, isSystemApps bool) []types.AppResult {
	apps := []types.AppResult{}

	for _, item := range packageNames {
		app := am.nameToResult(item, isSystemApps)
		if app != nil {
			apps = append(apps, *app)
		}
	}

	return apps
}

func (am *AppsManager) IsInstalled(packageName string, isSystemApp bool) bool {
	list := am.GetList(isSystemApp)
	return slices.Contains(list, packageName)
}

func (am *AppsManager) GetAll(isSystemApps bool) []types.AppResult {
	appList := am.GetList(isSystemApps)
	apps := am.namesToList(appList, isSystemApps)
	return apps
}

func (am *AppsManager) GetByPackageName(packageName string, isSystemApps bool) *types.AppResult {
	return am.nameToResult(packageName, isSystemApps)
}

func (am *AppsManager) GetByUid(uid int) []types.AppResult {
	appAssignments := readAssignments()
	var appList []string
	for id, assignment := range appAssignments {
		if id == uid {
			appList = assignment
			break
		}
	}
	apps := am.namesToList(appList, false)
	return apps
}

func (am *AppsManager) Install(path, nameSystemApp string) error {
	tempDir, err := os.MkdirTemp("", "lc-installer-*")
	if err != nil {
		return err
	}
	defer func() {
		_ = os.RemoveAll(tempDir)
	}()

	installer, err := readAppInstaller(path, tempDir)
	if err != nil {
		return err
	}

	if nameSystemApp != "" {
		if err := ValidatePackageName(nameSystemApp); err != nil {
			return err
		}
	}

	targetPackageName := installer.PackageName
	basePath := appsPath
	replaceExisting := false
	if nameSystemApp != "" {
		targetPackageName = nameSystemApp
		basePath = systemAppsPath
		replaceExisting = true
	}

	outDir, err := safeChildPath(basePath, targetPackageName)
	if err != nil {
		return err
	}

	return writeAppInstaller(installer, outDir, installer.Manifest, replaceExisting)
}

func (am *AppsManager) Update(path, packageName string, isSystemApp bool) error {
	if err := ValidatePackageName(packageName); err != nil {
		return err
	}

	if !am.IsInstalled(packageName, isSystemApp) {
		return fmt.Errorf("la aplicacion %q no esta instalada", packageName)
	}

	tempDir, err := os.MkdirTemp("", "lc-updater-*")
	if err != nil {
		return err
	}
	defer func() {
		_ = os.RemoveAll(tempDir)
	}()

	installer, err := readAppInstaller(path, tempDir)
	if err != nil {
		return err
	}

	if !isSystemApp && installer.PackageName != packageName {
		return fmt.Errorf("el instalador pertenece a %q, no a %q", installer.PackageName, packageName)
	}

	basePath := appsPath
	if isSystemApp {
		basePath = systemAppsPath
	}
	outDir, err := safeChildPath(basePath, packageName)
	if err != nil {
		return err
	}

	manifest := mergeAppManifestForUpdate(installer.Manifest, readManifest(packageName, isSystemApp))
	return writeAppInstaller(installer, outDir, manifest, true)
}

func readAppInstaller(path, tempDir string) (*appInstaller, error) {
	err := unzip(path, tempDir)
	if err != nil {
		return nil, err
	}

	fileName := filepath.Base(path)
	ext := filepath.Ext(fileName)
	packageName := strings.TrimSuffix(fileName, ext)
	if err := ValidatePackageName(packageName); err != nil {
		return nil, err
	}

	inManifestPath := filepath.Join(tempDir, "manifest.json")
	inCodePath := filepath.Join(tempDir, "code")
	inViewsDir := filepath.Join(tempDir, "views")

	if !utils.FileExists(inManifestPath) {
		return nil, errors.New("El instalador no tiene manifest.json.")
	}

	if !utils.DirExists(inCodePath) {
		return nil, errors.New("El instalador no tiene directorio de código.")
	}

	manifest, err := readOriginalManifest(inManifestPath)
	if err != nil {
		return nil, err
	}

	return &appInstaller{
		PackageName:        packageName,
		Manifest:           manifest,
		CodePath:           inCodePath,
		HeadTemplatePath:   filepath.Join(inViewsDir, "head.html"),
		BodyTemplatePath:   filepath.Join(inViewsDir, "body.html"),
		FooterTemplatePath: filepath.Join(inViewsDir, "footer.html"),
	}, nil
}

func readOriginalManifest(path string) (types.Manifest, error) {
	manifestData, err := os.ReadFile(path)
	if err != nil {
		return types.Manifest{}, err
	}

	var v originalManifestRecord
	err = json.Unmarshal(manifestData, &v)
	if err != nil {
		return types.Manifest{}, err
	}

	manifest := types.Manifest{
		Title:       v.Title,
		Description: v.Description,
		Author:      v.Author,
		Extentions:  make([]string, 0),
		Permissions: make(map[string]types.PermissionResult),
		Sources:     make(map[string][]types.Source),
	}

	for k, v := range v.Permissions {
		if permissionName, ok := NormalizePermissionName(k); ok {
			manifest.Permissions[permissionName] = types.PermissionResult{
				Description: v,
				Enable:      true,
			}
		}
	}

	for k, v := range v.Sources {
		if !slices.Contains(SourceTypesAllowed, k) {
			continue
		}
		manifest.Sources[k] = []types.Source{}
		counter := 1
		for k2, v2 := range v {
			manifest.Sources[k] = append(manifest.Sources[k], types.Source{
				Id:          counter,
				URL:         k2,
				Description: v2,
				Enable:      true,
			})
			counter++
		}
	}

	if v.Extentions != nil {
		manifest.Extentions = v.Extentions
	}

	return manifest, nil
}

func writeAppInstaller(installer *appInstaller, outDir string, manifest types.Manifest, replaceExisting bool) error {
	outManifestPath := filepath.Join(outDir, "manifest.json")
	outCodeDir := filepath.Join(outDir, "code")
	outViewsDir := filepath.Join(outDir, "views")
	outHeadTemplatePath := filepath.Join(outViewsDir, "head.html")
	outBodyTemplatePath := filepath.Join(outViewsDir, "body.html")
	outFooterTemplatePath := filepath.Join(outViewsDir, "footer.html")

	if replaceExisting {
		if err := os.RemoveAll(outDir); err != nil {
			return err
		}
	}

	if err := utils.CopyDir(installer.CodePath, outCodeDir); err != nil {
		return err
	}
	if err := utils.Mkdir(outCodeDir); err != nil {
		return err
	}
	if err := utils.Mkdir(outViewsDir); err != nil {
		return err
	}

	if utils.FileExists(installer.HeadTemplatePath) {
		if err := utils.CopyFile(installer.HeadTemplatePath, outHeadTemplatePath); err != nil {
			return err
		}
	} else {
		if err := utils.WriteFile(outHeadTemplatePath, ""); err != nil {
			return err
		}
	}

	if utils.FileExists(installer.BodyTemplatePath) {
		if err := utils.CopyFile(installer.BodyTemplatePath, outBodyTemplatePath); err != nil {
			return err
		}
	} else {
		if err := utils.WriteFile(outBodyTemplatePath, ""); err != nil {
			return err
		}
	}

	if utils.FileExists(installer.FooterTemplatePath) {
		if err := utils.CopyFile(installer.FooterTemplatePath, outFooterTemplatePath); err != nil {
			return err
		}
	} else {
		if err := utils.WriteFile(outFooterTemplatePath, ""); err != nil {
			return err
		}
	}

	if err := writeJSONAtomic(outManifestPath, manifest, 0600); err != nil {
		return err
	}

	return nil
}

func mergeAppManifestForUpdate(next types.Manifest, current *types.Manifest) types.Manifest {
	if current == nil {
		return next
	}

	for name, permission := range next.Permissions {
		if currentPermission, ok := current.Permissions[name]; ok {
			permission.Enable = currentPermission.Enable
			next.Permissions[name] = permission
		}
	}

	for sourceType, sources := range next.Sources {
		currentSourcesByURL := map[string]types.Source{}
		for _, source := range current.Sources[sourceType] {
			currentSourcesByURL[source.URL] = source
		}
		for i, source := range sources {
			if currentSource, ok := currentSourcesByURL[source.URL]; ok {
				source.Enable = currentSource.Enable
				sources[i] = source
			}
		}
		next.Sources[sourceType] = sources
	}

	return next
}

func (am *AppsManager) Uninstall(packageName string) error {
	appPath, err := safeChildPath(appsPath, packageName)
	if err != nil {
		return err
	}

	if err := os.RemoveAll(appPath); err != nil {
		return err
	}

	return nil
}

func (am *AppsManager) GetPaths(packageName string, isSystemApp bool) types.AppPaths {
	if err := ValidatePackageName(packageName); err != nil {
		return types.AppPaths{}
	}
	basePath := appsPath
	if isSystemApp {
		basePath = systemAppsPath
	}
	appPath, err := safeChildPath(basePath, packageName)
	if err != nil {
		return types.AppPaths{}
	}
	viewsPath := filepath.Join(appPath, "views")

	return types.AppPaths{
		Code: filepath.Join(appPath, "code"),
		Views: types.AppViewPaths{
			Head:   filepath.Join(viewsPath, "head.html"),
			Body:   filepath.Join(viewsPath, "body.html"),
			Footer: filepath.Join(viewsPath, "footer.html"),
		},
	}
}

func unzip(src string, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)

		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("ruta ilegal: %s", fpath)
		}

		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(fpath, 0755); err != nil {
				return err
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), 0755); err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			return err
		}

		outFile, err := os.Create(fpath)
		if err != nil {
			rc.Close()
			return err
		}

		if _, err = io.Copy(outFile, rc); err != nil {
			outFile.Close()
			rc.Close()
			return err
		}
		if err := outFile.Close(); err != nil {
			rc.Close()
			return err
		}
		if err := rc.Close(); err != nil {
			return err
		}
	}

	return nil
}
