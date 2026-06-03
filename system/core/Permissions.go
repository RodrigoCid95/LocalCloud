package core

import (
	"localcloud/types"
	"path/filepath"
	"slices"
	"strings"
)

const (
	APPS_GET_ALL = "APPS_GET_ALL"
	APPS_GET     = "APPS_GET"
	APPS_UPDATE  = "APPS_UPDATE"

	APP_BUS_CONNECT = "APP_BUS_CONNECT"
	APP_BUS_SHARED  = "APP_BUS_SHARED"

	NOTIFICATIONS_STREAM = "NOTIFICATIONS_STREAM"
	NOTIFICATIONS_SEND   = "NOTIFICATIONS_SEND"

	APP_STORE_READ    = "APP_STORE_READ"
	APP_STORE_WRITE   = "APP_STORE_WRITE"
	APP_STORE_DELETE  = "APP_STORE_DELETE"
	APP_STORE_COMPACT = "APP_STORE_COMPACT"

	PROFILE_GET                = "PROFILE_GET"
	PROFILE_GET_APPS           = "PROFILE_GET_APPS"
	PROFILE_UPDATE             = "PROFILE_UPDATE"
	PROFILE_SET_PASSWORD       = "PROFILE_SET_PASSWORD"
	PROFILE_SET_SAMBA_PASSWORD = "PROFILE_SET_SAMBA_PASSWORD"

	USERS_CREATE       = "USERS_CREATE"
	USERS_GET_ALL      = "USERS_GET_ALL"
	USERS_GET          = "USERS_GET"
	USERS_UPDATE       = "USERS_UPDATE"
	USERS_DELETE       = "USERS_DELETE"
	USERS_SET_PASSWORD = "USERS_SET_PASSWORD"

	ASSIGNMENTS_GET    = "ASSIGNMENTS_GET"
	ASSIGNMENTS_ADD    = "ASSIGNMENTS_ADD"
	ASSIGNMENTS_REMOVE = "ASSIGNMENTS_REMOVE"

	PERMISSIONS_GET     = "PERMISSIONS_GET"
	PERMISSIONS_ENABLE  = "PERMISSIONS_ENABLE"
	PERMISSIONS_DISABLE = "PERMISSIONS_DISABLE"

	SOURCES_GET     = "SOURCES_GET"
	SOURCES_ENABLE  = "SOURCES_ENABLE"
	SOURCES_DISABLE = "SOURCES_DISABLE"

	SAMBA_BELONGS_TO   = "SAMBA_BELONGS_TO"
	SAMBA_ENABLE       = "SAMBA_ENABLE"
	SAMBA_DISABLE      = "SAMBA_DISABLE"
	SAMBA_SET_PASSWORD = "SAMBA_SET_PASSWORD"

	SYSTEM_STATUS_GET = "SYSTEM_STATUS_GET"
	SYSTEM_SHUTDOWN   = "SYSTEM_SHUTDOWN"
	SYSTEM_REBOOT     = "SYSTEM_REBOOT"

	FILESYSTEM_READ_DIR   = "FILESYSTEM_READ_DIR"
	FILESYSTEM_READ_FILE  = "FILESYSTEM_READ_FILE"
	FILESYSTEM_CREATE_DIR = "FILESYSTEM_CREATE_DIR"
	FILESYSTEM_WRITE_FILE = "FILESYSTEM_WRITE_FILE"
	FILESYSTEM_DELETE     = "FILESYSTEM_DELETE"
	FILESYSTEM_RENAME     = "FILESYSTEM_RENAME"
)

type PermissionResult struct {
	Description string `json:"description"`
	Enable      bool   `json:"enable"`
}

type Permissions struct{}

func NormalizePermissionName(permission string) (string, bool) {
	normalized := strings.ToUpper(permission)
	index := slices.IndexFunc(PermissionsAllowed, func(allowed string) bool {
		return strings.ToUpper(allowed) == normalized
	})
	if index == -1 {
		return "", false
	}
	return PermissionsAllowed[index], true
}

func (p *Permissions) IsValid(permission string) bool {
	_, ok := NormalizePermissionName(permission)
	return ok
}

func (p *Permissions) Get(packageName string) []types.Permission {
	permissions := []types.Permission{}

	manifest := readManifest(packageName, false)
	if manifest == nil {
		return permissions
	}

	for name, permission := range manifest.Permissions {
		permissions = append(permissions, types.Permission{
			Name:        name,
			Description: permission.Description,
			Enable:      permission.Enable,
		})
	}

	return permissions
}

func (p *Permissions) Put(packageName string, name string, enable bool) {
	manifest := readManifest(packageName, false)
	if manifest == nil {
		return
	}

	permissionName, ok := NormalizePermissionName(name)
	if !ok {
		return
	}

	if perm, ok := manifest.Permissions[permissionName]; ok {
		perm.Enable = enable
		manifest.Permissions[permissionName] = perm
		path := filepath.Join(appsPath, packageName, "manifest.json")
		_ = writeJSONAtomic(path, manifest, 0600)
	}
}
