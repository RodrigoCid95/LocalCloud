package types

type Permission struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Enable      bool   `json:"enable"`
}

type PermissionResult struct {
	Description string `json:"description"`
	Enable      bool   `json:"enable"`
}

type Permissions interface {
	IsValid(permission string) bool
	Get(packageName string) []Permission
	Put(packageName string, name string, enable bool)
}
