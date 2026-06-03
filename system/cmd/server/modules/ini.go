package modules

import (
	"localcloud/core"
	"localcloud/utils"
)

type List struct {
	AppData       *core.AppData
	AppStore      *core.AppStore
	AppBus        *core.AppBus
	Notifications *core.Notifications
	AppsManager   *core.AppsManager
	Assignments   *core.Assignments
	FileSystem    *core.FileSystem
	GroupManager  *core.GroupManager
	Permissions   *core.Permissions
	SambaManager  *core.SambaManager
	SystemPower   *core.SystemPower
	Sources       *core.Sources
	SystemStatus  *core.SystemStatus
	UsersManager  *core.UsersManager
	Encrypt       *utils.Encrypt
}
