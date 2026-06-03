package core

import (
	"encoding/json"
	"fmt"
	"localcloud/types"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

var (
	accountNamePattern = regexp.MustCompile(`^[a-z_][a-z0-9_-]{0,31}\$?$`)
	packageNamePattern = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`)
)

func validateAccountName(name string) error {
	if !accountNamePattern.MatchString(name) {
		return fmt.Errorf("User name is not valid: %q", name)
	}
	return nil
}

func ValidatePackageName(name string) error {
	if !packageNamePattern.MatchString(name) || strings.ContainsAny(name, `/\`) || name == "." || name == ".." {
		return fmt.Errorf("Package name is not valid: %q", name)
	}
	return nil
}

func safeChildPath(basePath, name string) (string, error) {
	if err := ValidatePackageName(name); err != nil {
		return "", err
	}
	if basePath == "" {
		return "", fmt.Errorf("ruta base vacia")
	}

	baseClean, err := filepath.Abs(filepath.Clean(basePath))
	if err != nil {
		return "", err
	}
	childPath, err := filepath.Abs(filepath.Join(baseClean, name))
	if err != nil {
		return "", err
	}
	rel, err := filepath.Rel(baseClean, childPath)
	if err != nil {
		return "", err
	}
	if rel == "." || strings.HasPrefix(rel, ".."+string(os.PathSeparator)) || rel == ".." || filepath.IsAbs(rel) {
		return "", fmt.Errorf("ruta fuera de %s: %s", basePath, name)
	}
	return childPath, nil
}

func writeJSONAtomic(path string, value any, perm os.FileMode) error {
	content, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return writeFileAtomic(path, content, perm)
}

func writeFileAtomic(path string, content []byte, perm os.FileMode) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	tmp, err := os.CreateTemp(dir, "."+filepath.Base(path)+".tmp-*")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	cleanup := true
	defer func() {
		if cleanup {
			_ = os.Remove(tmpName)
		}
	}()

	if _, err := tmp.Write(content); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Chmod(perm); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmpName, path); err != nil {
		return err
	}
	cleanup = false
	return nil
}

func commandOutputError(cmd *exec.Cmd, output []byte, err error) error {
	if err == nil {
		return nil
	}
	cmdName := filepath.Base(cmd.Path)
	if cmdName == "." || cmdName == string(os.PathSeparator) {
		cmdName = "comando"
	}
	text := strings.TrimSpace(string(output))
	if text == "" {
		return fmt.Errorf("%s: %w", cmdName, err)
	}
	return fmt.Errorf("%s: %w: %s", cmdName, err, text)
}

func readManifest(packageName string, isSystemApp bool) *types.Manifest {
	if err := ValidatePackageName(packageName); err != nil {
		return nil
	}
	basePath := appsPath
	if isSystemApp {
		basePath = systemAppsPath
	}
	appPath, err := safeChildPath(basePath, packageName)
	if err != nil {
		return nil
	}
	path := filepath.Join(appPath, "manifest.json")
	if _, err := os.Stat(path); err != nil {
		return nil
	}
	content, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var manifest types.Manifest
	err = json.Unmarshal(content, &manifest)
	if err != nil {
		return nil
	}
	return &manifest
}

func readAssignments() types.AssignmentResults {
	if _, err := os.Stat(appAssignmentsPath); err != nil {
		return make(types.AssignmentResults)
	}
	content, err := os.ReadFile(appAssignmentsPath)
	if err != nil {
		return make(types.AssignmentResults)
	}
	var appAssignments types.AssignmentResults
	err = json.Unmarshal(content, &appAssignments)
	if err != nil {
		return make(types.AssignmentResults)
	}
	return appAssignments
}
