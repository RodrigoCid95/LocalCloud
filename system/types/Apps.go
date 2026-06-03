package types

type App struct {
	PackageName string   `json:"packageName"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Author      string   `json:"author"`
	Extentions  []string `json:"extentions"`
}

type AppResult struct {
	PackageName      string                      `json:"packageName"`
	Title            string                      `json:"title"`
	Description      string                      `json:"description"`
	Author           string                      `json:"author"`
	Extentions       []string                    `json:"extentions"`
	Permissions      map[string]PermissionResult `json:"permissions"`
	Sources          map[string][]Source         `json:"sources"`
	InstallationPath string                      `json:"installationPath"`
}

type AssignmentResults map[int][]string

type Manifest struct {
	Title       string                      `json:"title"`
	Description string                      `json:"description"`
	Author      string                      `json:"author"`
	Extentions  []string                    `json:"extentions"`
	Permissions map[string]PermissionResult `json:"permissions"`
	Sources     map[string][]Source         `json:"sources"`
}

type AppViewPaths struct {
	Head   string `json:"head"`
	Body   string `json:"body"`
	Footer string `json:"footer"`
}

type AppPaths struct {
	Code  string       `json:"code"`
	Views AppViewPaths `json:"views"`
}

type AppsManager interface {
	GetAll(isSystemApps bool) []AppResult
	GetByPackageName(packageName string, isSystemApps bool) *AppResult
	GetByUid(uid int) []AppResult
	Install(path, nameSystemApp string) error
	Update(path, packageName string, isSystemApp bool) error
	Uninstall(packageName string) error
}
