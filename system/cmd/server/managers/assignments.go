package managers

import (
	"localcloud/cmd/server/modules"
	"slices"
)

type AssignmentsManager struct {
	list map[UserId][]PackageName
}

func (am *AssignmentsManager) RegisterUser(uid UserId, apps []PackageName) {
	am.list[uid] = apps
}

func (am *AssignmentsManager) Add(uid UserId, app PackageName) {
	if _, ok := am.list[uid]; !ok {
		return
	}

	if slices.Contains(am.list[uid], app) {
		return
	}

	am.list[uid] = append(am.list[uid], app)
}

func (am *AssignmentsManager) Remove(uid UserId, app PackageName) {
	if _, ok := am.list[uid]; !ok {
		return
	}

	if !slices.Contains(am.list[uid], app) {
		return
	}

	i := slices.Index(am.list[uid], app)

	am.list[uid] = append(am.list[uid][:i], am.list[uid][i+1:]...)
}

func (am *AssignmentsManager) Get(uid UserId) []PackageName {
	return am.list[uid]
}

func (am *AssignmentsManager) Check(uid UserId, app PackageName) bool {
	if _, ok := am.list[uid]; !ok {
		return false
	}

	return slices.Contains(am.list[uid], app)
}

func NewAssignmentsManager(modules *modules.List) *AssignmentsManager {
	list := map[UserId][]PackageName{}
	users, _ := modules.UsersManager.GetAll()

	for _, user := range *users {
		list[user.Uid] = []PackageName{}
		assignments := modules.AppsManager.GetByUid(user.Uid)
		for _, assignment := range assignments {
			list[user.Uid] = append(list[user.Uid], assignment.PackageName)
		}
	}

	return &AssignmentsManager{
		list: list,
	}
}
