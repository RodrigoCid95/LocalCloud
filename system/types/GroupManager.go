package types

type Group struct {
	GID   int
	Name  string
	Users []string
}

type GroupManager interface {
	AddGroup(name string) (*int, error)
	RemoveGroup(name string) error
	AddUser(gname string, name string) error
	GetUsers(gname string) (*[]string, error)
	RemoveUser(gname string, name string) error
}
