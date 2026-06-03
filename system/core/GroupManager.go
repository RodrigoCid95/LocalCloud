package core

import (
	"io"
	"os"
	"os/exec"
	"slices"
	"strconv"
	"strings"
	"sync"
)

type Group struct {
	GID   int
	Name  string
	Users []string
}

type GroupManager struct {
	mu sync.RWMutex
}

func (gm *GroupManager) loadGroups() (*[]Group, error) {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	file, err := os.Open(groupPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	text := string(data)
	lines := strings.SplitSeq(text, "\n")
	groups := make([]Group, 0)
	for line := range lines {
		if line != "" {
			segments := strings.Split(line, ":")
			if len(segments) < 4 {
				continue
			}
			gid, err := strconv.Atoi(segments[2])
			if err != nil {
				continue
			}
			group := Group{
				GID:   int(gid),
				Name:  segments[0],
				Users: strings.Split(segments[3], ","),
			}
			groups = append(groups, group)
		}
	}

	return &groups, nil
}

func (gm *GroupManager) findIndexByName(groups *[]Group, name string) int {
	return slices.IndexFunc(*groups, func(g Group) bool {
		return g.Name == name
	})
}

func (gm *GroupManager) AddGroup(name string) (*int, error) {
	if err := validateAccountName(name); err != nil {
		return nil, err
	}
	groups, err := gm.loadGroups()
	if err != nil {
		return nil, err
	}
	index := gm.findIndexByName(groups, name)
	gid := 0
	if index == -1 {
		cmd := exec.Command("groupadd", name)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return nil, err
		}
		return gm.AddGroup(name)
	}
	gid = int((*groups)[index].GID)
	return &gid, nil
}

func (gm *GroupManager) RemoveGroup(name string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	groups, err := gm.loadGroups()
	if err != nil {
		return err
	}
	index := gm.findIndexByName(groups, name)
	if index != -1 {
		cmd := exec.Command("groupdel", name)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}

func (gm *GroupManager) AddUser(gname string, name string) error {
	if err := validateAccountName(gname); err != nil {
		return err
	}
	if err := validateAccountName(name); err != nil {
		return err
	}
	groups, err := gm.loadGroups()
	if err != nil {
		return err
	}
	index := gm.findIndexByName(groups, gname)
	if index == -1 {
		if _, err := gm.AddGroup(gname); err != nil {
			return err
		}
	}
	cmd := exec.Command("usermod", "-aG", gname, name)
	output, err := cmd.CombinedOutput()
	if err := commandOutputError(cmd, output, err); err != nil {
		return err
	}
	return nil
}

func (gm *GroupManager) GetUsers(gname string) (*[]string, error) {
	if err := validateAccountName(gname); err != nil {
		return nil, err
	}
	groups, err := gm.loadGroups()
	if err != nil {
		return nil, err
	}
	index := gm.findIndexByName(groups, gname)
	if index == -1 {
		if _, err := gm.AddGroup(gname); err != nil {
			return nil, err
		}
		result := make([]string, 0)
		return &result, nil
	}
	return &(*groups)[index].Users, nil
}

func (gm *GroupManager) RemoveUser(gname string, name string) error {
	if err := validateAccountName(gname); err != nil {
		return err
	}
	if err := validateAccountName(name); err != nil {
		return err
	}
	groups, err := gm.loadGroups()
	if err != nil {
		return err
	}
	index := gm.findIndexByName(groups, gname)
	if index == -1 {
		return nil
	}
	group := (*groups)[index]
	var user *string = nil
	for _, item := range group.Users {
		if item == name {
			user = &item
			break
		}
	}
	if user != nil {
		cmd := exec.Command("deluser", name, gname)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}
