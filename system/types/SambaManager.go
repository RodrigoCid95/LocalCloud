package types

type SambaManager interface {
	Put(name string, password string) error
	Delete(name string) error
	SetPassword(name string, password string) error
	Enable(name string) error
	Disable(name string) error
}
