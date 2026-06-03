package managers

import "localcloud/types"

type MemorySource struct {
	url    string
	enable bool
}

type MemorySourcesManager struct {
	list map[PackageName]map[SourceType]map[SourceId]MemorySource
}

func (msm *MemorySourcesManager) RegisterApp(manifest *types.AppResult) {
	msm.list[manifest.PackageName] = map[SourceType]map[SourceId]MemorySource{}

	for sourceType, sources := range manifest.Sources {
		msm.list[manifest.PackageName][sourceType] = map[SourceId]MemorySource{}
		for _, source := range sources {
			msm.list[manifest.PackageName][sourceType][source.Id] = MemorySource{
				url:    source.URL,
				enable: source.Enable,
			}
		}
	}
}

func (msm *MemorySourcesManager) UnRegisterApp(packageName PackageName) {
	delete(msm.list, packageName)
}

func (msm *MemorySourcesManager) Get(packageName PackageName) map[SourceType][]Source {
	_, ok := msm.list[packageName]
	if !ok {
		return map[SourceType][]Source{}
	}

	results := map[SourceType][]Source{}
	for sourceType, memorySources := range msm.list[packageName] {
		for _, memorySource := range memorySources {
			if memorySource.enable {
				if _, ok := results[sourceType]; !ok {
					results[sourceType] = []Source{}
				}
				results[sourceType] = append(results[sourceType], memorySource.url)
			}
		}
	}

	return results
}

func (msm *MemorySourcesManager) Update(packageName PackageName, sourceType SourceType, sourceId SourceId, enable bool) {
	if _, ok := msm.list[packageName]; ok {
		if _, ok := msm.list[packageName][sourceType]; ok {
			if _, ok := msm.list[packageName][sourceType][sourceId]; ok {
				ms := msm.list[packageName][sourceType][sourceId]
				msm.list[packageName][sourceType][sourceId] = MemorySource{
					url:    ms.url,
					enable: enable,
				}
			}
		}
	}
}

func NewMemorySourcesManager() *MemorySourcesManager {
	return &MemorySourcesManager{
		list: map[PackageName]map[SourceType]map[SourceId]MemorySource{},
	}
}
