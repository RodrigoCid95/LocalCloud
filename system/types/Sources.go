package types

type Source struct {
	Id          int    `json:"id"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Enable      bool   `json:"enable"`
}

type Sources interface {
	GetAll(packageName string) map[string][]Source
	Get(packageName string, sourceType string) []Source
	Put(packageName string, sourceType string, id int, enable bool)
}
