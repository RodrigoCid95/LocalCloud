package core

import (
	"localcloud/types"
	"path/filepath"
)

type Sources struct{}

func (s *Sources) GetAll(packageName string) map[string][]types.Source {
	manifest := readManifest(packageName, false)
	if manifest == nil {
		return map[string][]types.Source{}
	}

	return manifest.Sources
}

func (s *Sources) Get(packageName string, sourceType string) []types.Source {
	manifest := readManifest(packageName, false)
	if manifest == nil {
		return []types.Source{}
	}

	if sources, ok := manifest.Sources[sourceType]; ok {
		return sources
	}

	return []types.Source{}
}

func (s *Sources) Put(packageName string, sourceType string, id int, enable bool) {
	manifest := readManifest(packageName, false)
	if manifest == nil {
		return
	}

	if sources, ok := manifest.Sources[sourceType]; ok {
		for index, source := range sources {
			if source.Id == id {
				source.Enable = enable
				manifest.Sources[sourceType][index] = source
				path := filepath.Join(appsPath, packageName, "manifest.json")
				_ = writeJSONAtomic(path, manifest, 0600)
				break
			}
		}
	}
}
