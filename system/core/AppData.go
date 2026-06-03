package core

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
)

type AppData struct {
	mu sync.RWMutex
}

func (ad *AppData) GetGlobal(packageName string, key string) (json.RawMessage, error) {
	return ad.get(packageName, "", key)
}

func (ad *AppData) SetGlobal(packageName string, key string, value json.RawMessage) error {
	return ad.set(packageName, "", key, value)
}

func (ad *AppData) DeleteGlobal(packageName string, key string) error {
	return ad.delete(packageName, "", key)
}

func (ad *AppData) ListGlobal(packageName string) ([]string, error) {
	return ad.list(packageName, "")
}

func (ad *AppData) GetUser(packageName string, username string, key string) (json.RawMessage, error) {
	return ad.get(packageName, username, key)
}

func (ad *AppData) SetUser(packageName string, username string, key string, value json.RawMessage) error {
	return ad.set(packageName, username, key, value)
}

func (ad *AppData) DeleteUser(packageName string, username string, key string) error {
	return ad.delete(packageName, username, key)
}

func (ad *AppData) ListUser(packageName string, username string) ([]string, error) {
	return ad.list(packageName, username)
}

func (ad *AppData) get(packageName string, username string, key string) (json.RawMessage, error) {
	path, err := appDataFilePath(packageName, username, key)
	if err != nil {
		return nil, err
	}

	ad.mu.RLock()
	defer ad.mu.RUnlock()

	content, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return json.RawMessage(content), nil
}

func (ad *AppData) set(packageName string, username string, key string, value json.RawMessage) error {
	if !json.Valid(value) {
		return fmt.Errorf("valor JSON no valido")
	}

	path, err := appDataFilePath(packageName, username, key)
	if err != nil {
		return err
	}

	ad.mu.Lock()
	defer ad.mu.Unlock()

	return writeFileAtomic(path, value, 0600)
}

func (ad *AppData) delete(packageName string, username string, key string) error {
	path, err := appDataFilePath(packageName, username, key)
	if err != nil {
		return err
	}

	ad.mu.Lock()
	defer ad.mu.Unlock()

	if err := os.Remove(path); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

func (ad *AppData) list(packageName string, username string) ([]string, error) {
	dirPath, err := appDataDirPath(packageName, username)
	if err != nil {
		return nil, err
	}

	ad.mu.RLock()
	defer ad.mu.RUnlock()

	entries, err := os.ReadDir(dirPath)
	if errors.Is(err, os.ErrNotExist) {
		return []string{}, nil
	}
	if err != nil {
		return nil, err
	}

	result := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}
		result = append(result, strings.TrimSuffix(entry.Name(), ".json"))
	}
	sort.Strings(result)

	return result, nil
}

func appDataFilePath(packageName string, username string, key string) (string, error) {
	if err := validateAppDataKey(key); err != nil {
		return "", err
	}

	dirPath, err := appDataDirPath(packageName, username)
	if err != nil {
		return "", err
	}

	return filepath.Join(dirPath, key+".json"), nil
}

func appDataDirPath(packageName string, username string) (string, error) {
	appPath, err := safeChildPath(appDataPath, packageName)
	if err != nil {
		return "", err
	}

	if username == "" {
		return filepath.Join(appPath, "global"), nil
	}

	if err := validateAccountName(username); err != nil {
		return "", err
	}
	return filepath.Join(appPath, "users", username), nil
}

func validateAppDataKey(key string) error {
	if key == "" || key == "." || key == ".." || strings.ContainsAny(key, `/\`) {
		return fmt.Errorf("clave de datos de app no valida: %q", key)
	}
	return ValidatePackageName(key)
}
