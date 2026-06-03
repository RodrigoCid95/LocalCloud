package core

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type FileSystem struct{}

type FileSystemRoot string

const (
	FileSystemRootShared FileSystemRoot = "shared"
	FileSystemRootUser   FileSystemRoot = "user"
)

type FileSystemEntryType string

const (
	FileSystemEntryDirectory FileSystemEntryType = "directory"
	FileSystemEntryFile      FileSystemEntryType = "file"
)

type FileSystemEntry struct {
	Type      FileSystemEntryType `json:"type"`
	Name      string              `json:"name"`
	Children  int                 `json:"children,omitempty"`
	Size      int64               `json:"size,omitempty"`
	Extension string              `json:"extension,omitempty"`
}

type fileSystemOwner struct {
	uid int
	gid int
}

func (fs FileSystem) ReadDir(root FileSystemRoot, username string, path string) (*[]FileSystemEntry, error) {
	dirPath, err := fs.realPath(root, username, path)
	if err != nil {
		return nil, err
	}
	if err := ensurePathInsideBase(fs, root, username, dirPath, true); err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	result := make([]FileSystemEntry, 0, len(entries))
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return nil, err
		}

		item := FileSystemEntry{
			Name: entry.Name(),
		}

		if info.IsDir() {
			children, err := os.ReadDir(filepath.Join(dirPath, entry.Name()))
			if err != nil {
				return nil, err
			}
			item.Type = FileSystemEntryDirectory
			item.Children = len(children)
		} else {
			item.Type = FileSystemEntryFile
			item.Size = info.Size()
			item.Extension = strings.TrimPrefix(filepath.Ext(entry.Name()), ".")
		}

		result = append(result, item)
	}

	return &result, nil
}

func (fs FileSystem) ReadFile(root FileSystemRoot, username string, path string) ([]byte, error) {
	filePath, err := fs.realPath(root, username, path)
	if err != nil {
		return nil, err
	}
	if err := ensurePathInsideBase(fs, root, username, filePath, true); err != nil {
		return nil, err
	}

	return os.ReadFile(filePath)
}

func (fs FileSystem) OpenFile(root FileSystemRoot, username string, path string) (*os.File, error) {
	filePath, err := fs.realPath(root, username, path)
	if err != nil {
		return nil, err
	}
	if err := ensurePathInsideBase(fs, root, username, filePath, true); err != nil {
		return nil, err
	}

	return os.Open(filePath)
}

func (fs FileSystem) CreateDir(root FileSystemRoot, username string, path string) error {
	basePath, err := fs.rootPath(root, username)
	if err != nil {
		return err
	}
	dirPath, err := safeFileSystemPath(basePath, path)
	if err != nil {
		return err
	}

	owner, err := loadFileSystemOwner(username)
	if err != nil {
		return err
	}

	return mkdirAllOwned(basePath, dirPath, owner.uid, owner.gid)
}

func (fs FileSystem) WriteFile(root FileSystemRoot, username string, path string, source io.Reader) (int64, error) {
	filePath, err := fs.realPath(root, username, path)
	if err != nil {
		return 0, err
	}
	if err := ensurePathInsideBase(fs, root, username, filePath, false); err != nil {
		return 0, err
	}

	owner, err := loadFileSystemOwner(username)
	if err != nil {
		return 0, err
	}

	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	if err := file.Chown(owner.uid, owner.gid); err != nil {
		return 0, err
	}

	written, err := io.Copy(file, source)
	if err != nil {
		return written, err
	}

	if err := file.Sync(); err != nil {
		return written, err
	}

	return written, nil
}

func (fs FileSystem) Delete(root FileSystemRoot, username string, path string) error {
	if path == "" {
		return fmt.Errorf("ruta requerida")
	}

	targetPath, err := fs.realPath(root, username, path)
	if err != nil {
		return err
	}
	if err := ensurePathInsideBase(fs, root, username, targetPath, true); err != nil {
		return err
	}

	return os.RemoveAll(targetPath)
}

func (fs FileSystem) Rename(root FileSystemRoot, username string, path string, newName string) error {
	if path == "" {
		return fmt.Errorf("ruta requerida")
	}
	if newName == "" || newName == "." || newName == ".." || strings.ContainsAny(newName, `/\`) {
		return fmt.Errorf("nombre no valido: %s", newName)
	}

	sourcePath, err := fs.realPath(root, username, path)
	if err != nil {
		return err
	}
	if err := ensurePathInsideBase(fs, root, username, sourcePath, true); err != nil {
		return err
	}

	targetPath := filepath.Join(filepath.Dir(sourcePath), newName)
	if err := ensurePathInsideBase(fs, root, username, filepath.Dir(targetPath), true); err != nil {
		return err
	}
	if _, err := os.Lstat(targetPath); err == nil {
		return fmt.Errorf("la ruta ya existe: %s", targetPath)
	} else if !os.IsNotExist(err) {
		return err
	}

	return os.Rename(sourcePath, targetPath)
}

func (fs FileSystem) realPath(root FileSystemRoot, username string, path string) (string, error) {
	basePath, err := fs.rootPath(root, username)
	if err != nil {
		return "", err
	}

	return safeFileSystemPath(basePath, path)
}

func (fs FileSystem) rootPath(root FileSystemRoot, username string) (string, error) {
	switch root {
	case FileSystemRootShared:
		return sharedDirPath, nil
	case FileSystemRootUser:
		if err := validateAccountName(username); err != nil {
			return "", err
		}
		return filepath.Join(homePath, username), nil
	default:
		return "", fmt.Errorf("raiz de sistema de archivos no valida: %q", root)
	}
}

func safeFileSystemPath(basePath string, path string) (string, error) {
	if basePath == "" {
		return "", fmt.Errorf("ruta base vacia")
	}

	baseClean, err := filepath.Abs(filepath.Clean(basePath))
	if err != nil {
		return "", err
	}

	cleanPath := filepath.Clean(path)
	if path == "" || cleanPath == "." {
		return baseClean, nil
	}
	if filepath.IsAbs(cleanPath) {
		return "", fmt.Errorf("ruta absoluta no permitida: %s", path)
	}

	targetPath, err := filepath.Abs(filepath.Join(baseClean, cleanPath))
	if err != nil {
		return "", err
	}

	rel, err := filepath.Rel(baseClean, targetPath)
	if err != nil {
		return "", err
	}
	if rel == "." || rel == ".." || strings.HasPrefix(rel, ".."+string(os.PathSeparator)) || filepath.IsAbs(rel) {
		return "", fmt.Errorf("ruta fuera de %s: %s", basePath, path)
	}

	return targetPath, nil
}

func loadFileSystemOwner(username string) (*fileSystemOwner, error) {
	if err := validateAccountName(username); err != nil {
		return nil, err
	}

	content, err := os.ReadFile(passwdPath)
	if err != nil {
		return nil, err
	}

	for line := range strings.SplitSeq(string(content), "\n") {
		if line == "" {
			continue
		}

		segments := strings.Split(line, ":")
		if len(segments) < 4 || segments[0] != username {
			continue
		}

		uid, err := strconv.Atoi(segments[2])
		if err != nil {
			return nil, err
		}
		gid, err := strconv.Atoi(segments[3])
		if err != nil {
			return nil, err
		}

		return &fileSystemOwner{
			uid: uid,
			gid: gid,
		}, nil
	}

	return nil, fmt.Errorf("usuario no encontrado: %s", username)
}

func mkdirAllOwned(basePath string, targetPath string, uid int, gid int) error {
	baseClean, err := filepath.Abs(filepath.Clean(basePath))
	if err != nil {
		return err
	}
	targetClean, err := filepath.Abs(filepath.Clean(targetPath))
	if err != nil {
		return err
	}

	rel, err := filepath.Rel(baseClean, targetClean)
	if err != nil {
		return err
	}
	if rel == "." {
		return nil
	}

	currentPath := baseClean
	for _, segment := range strings.Split(rel, string(os.PathSeparator)) {
		currentPath = filepath.Join(currentPath, segment)
		info, err := os.Lstat(currentPath)
		if err == nil {
			if info.Mode()&os.ModeSymlink != 0 {
				return fmt.Errorf("la ruta es un enlace simbolico: %s", currentPath)
			}
			if !info.IsDir() {
				return fmt.Errorf("la ruta existe y no es un directorio: %s", currentPath)
			}
			continue
		}
		if !os.IsNotExist(err) {
			return err
		}
		if err := os.Mkdir(currentPath, 0755); err != nil {
			return err
		}
		if err := os.Chown(currentPath, uid, gid); err != nil {
			return err
		}
	}

	return nil
}

func ensurePathInsideBase(fs FileSystem, root FileSystemRoot, username string, targetPath string, targetMustExist bool) error {
	basePath, err := fs.rootPath(root, username)
	if err != nil {
		return err
	}

	baseReal, err := filepath.EvalSymlinks(basePath)
	if err != nil {
		return err
	}

	checkPath := targetPath
	if !targetMustExist {
		if _, err := os.Lstat(targetPath); err != nil {
			if !os.IsNotExist(err) {
				return err
			}
			checkPath = filepath.Dir(targetPath)
		}
	}

	targetReal, err := filepath.EvalSymlinks(checkPath)
	if err != nil {
		return err
	}

	rel, err := filepath.Rel(baseReal, targetReal)
	if err != nil {
		return err
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(os.PathSeparator)) || filepath.IsAbs(rel) {
		return fmt.Errorf("ruta fuera de %s: %s", basePath, targetPath)
	}

	return nil
}
