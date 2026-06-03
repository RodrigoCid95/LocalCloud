package core

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	appStoreOpPut    = "put"
	appStoreOpDelete = "delete"
)

type AppStore struct {
	mu sync.RWMutex
}

type AppStoreDocument struct {
	ID        string          `json:"id"`
	Value     json.RawMessage `json:"value"`
	CreatedAt time.Time       `json:"createdAt"`
	UpdatedAt time.Time       `json:"updatedAt"`
}

type AppStoreListOptions struct {
	Offset int
	Limit  int
	Desc   bool
}

type appStoreRecord struct {
	Seq       uint64          `json:"seq"`
	Op        string          `json:"op"`
	ID        string          `json:"id"`
	Value     json.RawMessage `json:"value,omitempty"`
	CreatedAt time.Time       `json:"createdAt,omitempty"`
	UpdatedAt time.Time       `json:"updatedAt,omitempty"`
}

type appStoreState struct {
	seq   uint64
	order []string
	docs  map[string]AppStoreDocument
}

func (s *AppStore) InsertGlobal(packageName string, collection string, value json.RawMessage) (string, error) {
	return s.insert(packageName, "", collection, value)
}

func (s *AppStore) PutGlobal(packageName string, collection string, id string, value json.RawMessage) error {
	return s.put(packageName, "", collection, id, value)
}

func (s *AppStore) GetGlobal(packageName string, collection string, id string) (*AppStoreDocument, error) {
	return s.get(packageName, "", collection, id)
}

func (s *AppStore) DeleteGlobal(packageName string, collection string, id string) error {
	return s.delete(packageName, "", collection, id)
}

func (s *AppStore) ListGlobal(packageName string, collection string, opts AppStoreListOptions) ([]AppStoreDocument, error) {
	return s.list(packageName, "", collection, opts)
}

func (s *AppStore) ListGlobalCollections(packageName string) ([]string, error) {
	return s.listCollections(packageName, "")
}

func (s *AppStore) CompactGlobal(packageName string, collection string) error {
	return s.compact(packageName, "", collection)
}

func (s *AppStore) InsertUser(packageName string, username string, collection string, value json.RawMessage) (string, error) {
	return s.insert(packageName, username, collection, value)
}

func (s *AppStore) PutUser(packageName string, username string, collection string, id string, value json.RawMessage) error {
	return s.put(packageName, username, collection, id, value)
}

func (s *AppStore) GetUser(packageName string, username string, collection string, id string) (*AppStoreDocument, error) {
	return s.get(packageName, username, collection, id)
}

func (s *AppStore) DeleteUser(packageName string, username string, collection string, id string) error {
	return s.delete(packageName, username, collection, id)
}

func (s *AppStore) ListUser(packageName string, username string, collection string, opts AppStoreListOptions) ([]AppStoreDocument, error) {
	return s.list(packageName, username, collection, opts)
}

func (s *AppStore) ListUserCollections(packageName string, username string) ([]string, error) {
	return s.listCollections(packageName, username)
}

func (s *AppStore) CompactUser(packageName string, username string, collection string) error {
	return s.compact(packageName, username, collection)
}

func (s *AppStore) insert(packageName string, username string, collection string, value json.RawMessage) (string, error) {
	id, err := newAppStoreID()
	if err != nil {
		return "", err
	}
	return id, s.put(packageName, username, collection, id, value)
}

func (s *AppStore) put(packageName string, username string, collection string, id string, value json.RawMessage) error {
	if !json.Valid(value) {
		return fmt.Errorf("valor JSON no valido")
	}
	if err := validateAppStoreID(id); err != nil {
		return err
	}

	path, err := appStoreFilePath(packageName, username, collection)
	if err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	state, err := readAppStoreState(path)
	if err != nil {
		return err
	}

	now := time.Now().UTC()
	createdAt := now
	if current, ok := state.docs[id]; ok {
		createdAt = current.CreatedAt
	}

	return appendAppStoreRecord(path, appStoreRecord{
		Seq:       state.seq + 1,
		Op:        appStoreOpPut,
		ID:        id,
		Value:     value,
		CreatedAt: createdAt,
		UpdatedAt: now,
	})
}

func (s *AppStore) get(packageName string, username string, collection string, id string) (*AppStoreDocument, error) {
	if err := validateAppStoreID(id); err != nil {
		return nil, err
	}

	path, err := appStoreFilePath(packageName, username, collection)
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	state, err := readAppStoreState(path)
	if err != nil {
		return nil, err
	}

	doc, ok := state.docs[id]
	if !ok {
		return nil, nil
	}
	return &doc, nil
}

func (s *AppStore) delete(packageName string, username string, collection string, id string) error {
	if err := validateAppStoreID(id); err != nil {
		return err
	}

	path, err := appStoreFilePath(packageName, username, collection)
	if err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	state, err := readAppStoreState(path)
	if err != nil {
		return err
	}
	if _, ok := state.docs[id]; !ok {
		return nil
	}

	return appendAppStoreRecord(path, appStoreRecord{
		Seq:       state.seq + 1,
		Op:        appStoreOpDelete,
		ID:        id,
		UpdatedAt: time.Now().UTC(),
	})
}

func (s *AppStore) list(packageName string, username string, collection string, opts AppStoreListOptions) ([]AppStoreDocument, error) {
	path, err := appStoreFilePath(packageName, username, collection)
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	state, err := readAppStoreState(path)
	if err != nil {
		return nil, err
	}

	ids := append([]string(nil), state.order...)
	if opts.Desc {
		for left, right := 0, len(ids)-1; left < right; left, right = left+1, right-1 {
			ids[left], ids[right] = ids[right], ids[left]
		}
	}

	offset := opts.Offset
	if offset < 0 {
		offset = 0
	}
	if offset >= len(ids) {
		return []AppStoreDocument{}, nil
	}

	end := len(ids)
	if opts.Limit > 0 && offset+opts.Limit < end {
		end = offset + opts.Limit
	}

	results := make([]AppStoreDocument, 0, end-offset)
	for _, id := range ids[offset:end] {
		if doc, ok := state.docs[id]; ok {
			results = append(results, doc)
		}
	}
	return results, nil
}

func (s *AppStore) compact(packageName string, username string, collection string) error {
	path, err := appStoreFilePath(packageName, username, collection)
	if err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	state, err := readAppStoreState(path)
	if err != nil {
		return err
	}

	records := make([]appStoreRecord, 0, len(state.order))
	for _, id := range state.order {
		doc, ok := state.docs[id]
		if !ok {
			continue
		}
		records = append(records, appStoreRecord{
			Seq:       uint64(len(records) + 1),
			Op:        appStoreOpPut,
			ID:        doc.ID,
			Value:     doc.Value,
			CreatedAt: doc.CreatedAt,
			UpdatedAt: doc.UpdatedAt,
		})
	}

	return writeAppStoreRecordsAtomic(path, records)
}

func (s *AppStore) listCollections(packageName string, username string) ([]string, error) {
	dirPath, err := appStoreDirPath(packageName, username)
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	entries, err := os.ReadDir(dirPath)
	if errors.Is(err, os.ErrNotExist) {
		return []string{}, nil
	}
	if err != nil {
		return nil, err
	}

	results := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".log" {
			continue
		}
		results = append(results, strings.TrimSuffix(entry.Name(), ".log"))
	}
	sort.Strings(results)

	return results, nil
}

func appStoreFilePath(packageName string, username string, collection string) (string, error) {
	if err := validateAppDataKey(collection); err != nil {
		return "", err
	}

	dirPath, err := appStoreDirPath(packageName, username)
	if err != nil {
		return "", err
	}

	return filepath.Join(dirPath, collection+".log"), nil
}

func appStoreDirPath(packageName string, username string) (string, error) {
	dirPath, err := appDataDirPath(packageName, username)
	if err != nil {
		return "", err
	}

	return filepath.Join(dirPath, "store"), nil
}

func readAppStoreState(path string) (appStoreState, error) {
	state := appStoreState{
		docs: make(map[string]AppStoreDocument),
	}

	file, err := os.Open(path)
	if errors.Is(err, os.ErrNotExist) {
		return state, nil
	}
	if err != nil {
		return state, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 64*1024), 16*1024*1024)

	line := 0
	for scanner.Scan() {
		line++
		text := strings.TrimSpace(scanner.Text())
		if text == "" {
			continue
		}

		var record appStoreRecord
		if err := json.Unmarshal([]byte(text), &record); err != nil {
			return state, fmt.Errorf("%s:%d: %w", path, line, err)
		}
		if err := validateAppStoreRecord(record); err != nil {
			return state, fmt.Errorf("%s:%d: %w", path, line, err)
		}
		if record.Seq > state.seq {
			state.seq = record.Seq
		}

		switch record.Op {
		case appStoreOpPut:
			if _, ok := state.docs[record.ID]; !ok {
				state.order = append(state.order, record.ID)
			}
			state.docs[record.ID] = AppStoreDocument{
				ID:        record.ID,
				Value:     append(json.RawMessage(nil), record.Value...),
				CreatedAt: record.CreatedAt,
				UpdatedAt: record.UpdatedAt,
			}
		case appStoreOpDelete:
			if _, ok := state.docs[record.ID]; ok {
				delete(state.docs, record.ID)
				state.order = removeAppStoreID(state.order, record.ID)
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return state, err
	}

	return state, nil
}

func appendAppStoreRecord(path string, record appStoreRecord) error {
	if err := validateAppStoreRecord(record); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return err
	}
	defer file.Close()

	if err := file.Chmod(0600); err != nil {
		return err
	}

	content, err := json.Marshal(record)
	if err != nil {
		return err
	}
	content = append(content, '\n')

	if _, err := file.Write(content); err != nil {
		return err
	}
	return file.Sync()
}

func writeAppStoreRecordsAtomic(path string, records []appStoreRecord) error {
	sort.SliceStable(records, func(i, j int) bool {
		return records[i].Seq < records[j].Seq
	})

	content := make([]byte, 0)
	for _, record := range records {
		if err := validateAppStoreRecord(record); err != nil {
			return err
		}
		line, err := json.Marshal(record)
		if err != nil {
			return err
		}
		content = append(content, line...)
		content = append(content, '\n')
	}

	return writeFileAtomic(path, content, 0600)
}

func validateAppStoreRecord(record appStoreRecord) error {
	if record.Seq == 0 {
		return fmt.Errorf("registro de app store sin secuencia")
	}
	if err := validateAppStoreID(record.ID); err != nil {
		return err
	}

	switch record.Op {
	case appStoreOpPut:
		if !json.Valid(record.Value) {
			return fmt.Errorf("valor JSON no valido")
		}
	case appStoreOpDelete:
	default:
		return fmt.Errorf("operacion de app store no valida: %q", record.Op)
	}
	return nil
}

func validateAppStoreID(id string) error {
	if id == "" || id == "." || id == ".." || len(id) > 128 || strings.ContainsAny(id, `/\`) {
		return fmt.Errorf("id de documento de app store no valido: %q", id)
	}
	return ValidatePackageName(id)
}

func newAppStoreID() (string, error) {
	var raw [16]byte
	if _, err := rand.Read(raw[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(raw[:]), nil
}

func removeAppStoreID(ids []string, id string) []string {
	for index, current := range ids {
		if current == id {
			return append(ids[:index], ids[index+1:]...)
		}
	}
	return ids
}
