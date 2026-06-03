package types

type DataUser struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

type User struct {
	Uid      int    `json:"uid"`
	Name     string `json:"name"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

type Profile struct {
	Uid            int    `json:"uid"`
	Name           string `json:"name"`
	FullName       string `json:"fullName"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	BelongsToSamba bool   `json:"belongsToSamba"`
}

type NewUser struct {
	Name     string `json:"name"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type UserResult struct {
	Uid          int
	Name         string
	FullName     string
	Email        string
	Phone        string
	PasswordHash string
	Home         string
}

type UsersManager interface {
	Get(name string) (*UserResult, error)
	GetByUid(uid int) (*UserResult, error)
	GetAll() (*[]UserResult, error)
	SetPassword(name string, password string) error
	Create(gname string, new NewUser) (*int, error)
	Update(name string, data DataUser) error
	Delete(uid int) error
}
