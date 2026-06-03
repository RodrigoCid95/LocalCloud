package app

import (
	"embed"
	"html/template"
	"io"
	"localcloud/types"

	"github.com/labstack/echo/v4"
)

//go:embed www/layout.html
var layoutFS embed.FS

type AppRenderer struct {
	layout *template.Template
	paths  types.AppViewPaths
}

func NewRenderer() *AppRenderer {
	tpl := template.Must(template.ParseFS(layoutFS, "www/layout.html"))
	return &AppRenderer{
		layout: tpl,
	}
}

func (r *AppRenderer) Render(w io.Writer, name string, data any, c echo.Context) error {
	viewData, ok := data.(map[string]any)
	if !ok || viewData == nil {
		viewData = map[string]any{}
	}

	return r.layout.Execute(w, viewData)
}
