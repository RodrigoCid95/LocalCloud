package core

import (
	"fmt"
	"io"
	"localcloud/types"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync"
)

type UsersManager struct {
	mu sync.RWMutex
	gm GroupManager
}

type shadowLine struct {
	name string
	hash string
}

func (um *UsersManager) loadUsers() (*[]types.UserResult, error) {
	um.mu.Lock()
	defer um.mu.Unlock()

	users := make([]types.UserResult, 0)

	shadowFile, shadowErr := os.Open(shadowPath)
	if shadowErr != nil {
		return nil, shadowErr
	}
	defer shadowFile.Close()

	shadowContent, shadowContentErr := io.ReadAll(shadowFile)
	if shadowContentErr != nil {
		return nil, shadowContentErr
	}

	shadowList := make([]shadowLine, 0)
	shadowLines := strings.SplitSeq(string(shadowContent), "\n")
	for line := range shadowLines {
		if line != "" {
			segments := strings.Split(line, ":")
			if len(segments) < 2 {
				continue
			}
			shadowList = append(shadowList, shadowLine{
				name: segments[0],
				hash: segments[1],
			})
		}
	}

	passwdFile, passwdFileErr := os.Open(passwdPath)
	if passwdFileErr != nil {
		return nil, passwdFileErr
	}
	defer passwdFile.Close()

	passwdContent, passwdContentErr := io.ReadAll(passwdFile)
	if passwdContentErr != nil {
		return nil, passwdContentErr
	}

	passwdLines := strings.SplitSeq(string(passwdContent), "\n")
	for line := range passwdLines {
		if line != "" {
			segments := strings.Split(line, ":")
			if len(segments) < 6 {
				continue
			}
			name := segments[0]
			home := segments[5]
			shadowLineIndex := slices.IndexFunc(shadowList, func(sl shadowLine) bool {
				return sl.name == name
			})
			if shadowLineIndex == -1 {
				continue
			}
			shadowLine := shadowList[shadowLineIndex]
			uidStr := segments[2]
			comment := segments[4]
			comment = strings.ReplaceAll(comment, "\\", "")
			comment = strings.ReplaceAll(comment, "'", "")
			commentSegments := strings.Split(comment, ",")
			fullName := ""
			if len(commentSegments) > 0 && commentSegments[0] != "" {
				fullName = commentSegments[0]
			}
			email := ""
			if len(commentSegments) > 1 && commentSegments[1] != "" {
				email = commentSegments[1]
			}
			phone := ""
			if len(commentSegments) > 2 && commentSegments[2] != "" {
				phone = commentSegments[2]
			}
			uid, err := strconv.Atoi(uidStr)
			if err != nil {
				return nil, err
			}
			users = append(users, types.UserResult{
				Uid:          uid,
				Name:         name,
				FullName:     fullName,
				Email:        email,
				Phone:        phone,
				Home:         home,
				PasswordHash: shadowLine.hash,
			})
		}
	}

	return &users, nil
}

func (um *UsersManager) Get(name string) (*types.UserResult, error) {
	users, err := um.loadUsers()
	if err != nil {
		return nil, err
	}
	userIndex := slices.IndexFunc(*users, func(u types.UserResult) bool {
		return u.Name == name
	})
	if userIndex == -1 {
		return nil, nil
	}
	result := (*users)[userIndex]
	return &result, nil
}

func (um *UsersManager) GetByUid(uid int) (*types.UserResult, error) {
	users, err := um.loadUsers()
	if err != nil {
		return nil, err
	}
	userIndex := slices.IndexFunc(*users, func(u types.UserResult) bool {
		return u.Uid == uid
	})
	if userIndex == -1 {
		return nil, nil
	}
	result := (*users)[userIndex]
	return &result, nil
}

func (um *UsersManager) GetAll() (*[]types.UserResult, error) {
	return um.loadUsers()
}

func (um *UsersManager) SetPassword(name string, password string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	user, err := um.Get(name)
	if err != nil {
		return err
	}
	if user != nil {
		hash, hashErr := encrypt.CreateHash(password, nil)
		if hashErr != nil {
			return hashErr
		}
		cmd := exec.Command("usermod", "-p", *hash, name)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}

func (um *UsersManager) Create(gname string, new types.NewUser) (*int, error) {
	if err := validateAccountName(gname); err != nil {
		return nil, err
	}
	if err := validateAccountName(new.Name); err != nil {
		return nil, err
	}
	userList, userListError := um.loadUsers()
	if userListError != nil {
		return nil, userListError
	}
	userIndex := slices.IndexFunc(*userList, func(u types.UserResult) bool {
		return u.Name == new.Name
	})
	if userIndex != -1 {
		user := (*userList)[userIndex]
		return &user.Uid, nil
	}
	comment := fmt.Sprintf("%s,%s,%s", new.FullName, new.Email, new.Phone)
	cmd := exec.Command("useradd", "-m", "-s", "/bin/bash", new.Name, "-c", comment)
	output, err := cmd.CombinedOutput()
	if err := commandOutputError(cmd, output, err); err != nil {
		return nil, err
	}
	err = um.gm.AddUser(gname, new.Name)
	if err != nil {
		return nil, err
	}
	err = um.SetPassword(new.Name, new.Password)
	if err != nil {
		return nil, err
	}
	file, err := os.Create(filepath.Join(homePath, new.Name, ".lc"))
	if err != nil {
		return nil, err
	}
	if err := file.Close(); err != nil {
		return nil, err
	}
	return um.Create(gname, new)
}

func (um *UsersManager) Update(name string, data types.DataUser) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	userList, userListError := um.loadUsers()
	if userListError != nil {
		return userListError
	}
	userIndex := slices.IndexFunc(*userList, func(u types.UserResult) bool {
		return u.Name == name
	})
	if userIndex != -1 {
		comment := fmt.Sprintf("%s,%s,%s", data.FullName, data.Email, data.Phone)
		cmd := exec.Command("usermod", "-c", comment, name)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}

func (um *UsersManager) Delete(uid int) error {
	userList, userListError := um.loadUsers()
	if userListError != nil {
		return userListError
	}
	userIndex := slices.IndexFunc(*userList, func(u types.UserResult) bool {
		return u.Uid == uid
	})
	if userIndex != -1 {
		user := (*userList)[userIndex]
		cmd := exec.Command("deluser", "--remove-all-files", user.Name)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}
