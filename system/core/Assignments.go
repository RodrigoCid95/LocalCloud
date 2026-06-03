package core

import (
	"slices"
	"sync"
)

type Assignments struct {
	mu sync.Mutex
}

func (a *Assignments) Add(uid int, packageName string) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if err := ValidatePackageName(packageName); err != nil {
		return
	}

	assigments := readAssignments()
	if !slices.Contains(assigments[uid], packageName) {
		assigments[uid] = append(assigments[uid], packageName)
	}

	_ = writeJSONAtomic(appAssignmentsPath, assigments, 0600)
}

func (a *Assignments) Remove(uid int, packageName string) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if err := ValidatePackageName(packageName); err != nil {
		return
	}

	assigments := readAssignments()
	if slices.Contains(assigments[uid], packageName) {
		newAssigments := []string{}
		for _, v := range assigments[uid] {
			if v != packageName {
				newAssigments = append(newAssigments, v)
			}
		}
		assigments[uid] = newAssigments
	}

	_ = writeJSONAtomic(appAssignmentsPath, assigments, 0600)
}
