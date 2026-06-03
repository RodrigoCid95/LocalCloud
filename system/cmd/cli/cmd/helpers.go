package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"text/tabwriter"
)

func exitOnError(err error) {
	if err == nil {
		return
	}
	fmt.Fprintf(os.Stderr, "Error: %v\n", err)
	os.Exit(1)
}

func printJSON(value any) {
	content, err := json.Marshal(value)
	exitOnError(err)
	fmt.Println(string(content))
}

func flushTable(w *tabwriter.Writer) {
	exitOnError(w.Flush())
}
