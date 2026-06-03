package managers

import (
	"localcloud/types"
)

type MemoryPermissionsManager struct {
	list map[PackageName]map[Permission]bool
}

func (mpm *MemoryPermissionsManager) RegisterApp(manifest *types.AppResult) {
	mpm.list[manifest.PackageName] = map[Permission]bool{}

	for permission, value := range manifest.Permissions {
		mpm.list[manifest.PackageName][permission] = value.Enable
	}
}

func (mpm *MemoryPermissionsManager) UnRegisterApp(packageName PackageName) {
	delete(mpm.list, packageName)
}

func (mpm *MemoryPermissionsManager) Get(packageName PackageName) []Permission {
	results := []Permission{}

	if _, ok := mpm.list[packageName]; ok {
		for p, e := range mpm.list[packageName] {
			if e {
				results = append(results, p)
			}
		}
	}

	return results
}

func (mpm *MemoryPermissionsManager) Update(packageName PackageName, permission Permission, value bool) {
	_, ok := mpm.list[packageName]
	if ok {
		mpm.list[packageName][permission] = value
	}
}

func (mpm *MemoryPermissionsManager) Check(packageName PackageName, permission Permission) bool {
	if _, ok := mpm.list[packageName]; ok {
		if _, ok := mpm.list[packageName][permission]; ok {
			return mpm.list[packageName][permission]
		}
	}

	return false
}

func (mpm *MemoryPermissionsManager) CheckApp(packageName PackageName) bool {
	_, ok := mpm.list[packageName]
	return ok
}

func NewMemoryPermissionsManager() *MemoryPermissionsManager {
	return &MemoryPermissionsManager{
		list: map[PackageName]map[Permission]bool{},
	}
}
