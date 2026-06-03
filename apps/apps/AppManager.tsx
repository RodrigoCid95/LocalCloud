import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Badge,
  Body1,
  Button,
  Caption1,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  FluentProvider,
  Input,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  OverlayDrawer,
  Spinner,
  Subtitle2,
  Text,
  Title1,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  AppsListDetailRegular,
  ArrowClockwiseRegular,
  DismissRegular,
  SearchRegular,
  WarningRegular,
} from '@fluentui/react-icons'

import { AppDetails } from './components/AppDetails'
import { AppsGrid } from './components/AppsGrid'
import { sourceTypes } from './constants'
import { useStyles } from './styles'
import type { AppInfo, PermissionInfo, SourceGroup, SourceInfo, UpdateTask } from './types'
import { currentPackageName, getExtensions, getSourceKey } from './utils'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const mobileModeQuery = window.matchMedia('(max-width: 940px)')

const AppManager = () => {
  const styles = useStyles()
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [apps, setApps] = useState<AppInfo[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [permissions, setPermissions] = useState<PermissionInfo[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false)
  const [permissionsError, setPermissionsError] = useState<string>('')
  const [savingPermissions, setSavingPermissions] = useState<Set<string>>(new Set())
  const [permissionsExpanded, setPermissionsExpanded] = useState<boolean>(false)
  const [sources, setSources] = useState<LocalCloud.Sources>({} as LocalCloud.Sources)
  const [sourcesLoading, setSourcesLoading] = useState<boolean>(false)
  const [sourcesError, setSourcesError] = useState<string>('')
  const [savingSources, setSavingSources] = useState<Set<string>>(new Set())
  const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(false)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(mobileModeQuery.matches)
  const [updateTask, setUpdateTask] = useState<UpdateTask | null>(null)
  const updateUploadRef = useRef<LocalCloud.AppUpdateUpload | null>(null)
  const updateInputRef = useRef<HTMLInputElement | null>(null)

  const canUpdateApps = typeof window.sdk.apps.createUpdateUpload === 'function'

  const loadApps = useCallback(() => {
    setLoading(true)
    setError('')

    window.sdk.apps.getAll()
      .then(results => {
        setApps(results)
        setSelectedPackage(current => {
          if (current && results.some(app => app.packageName === current)) {
            return current
          }

          return results[0]?.packageName ?? ''
        })
      })
      .catch(reason => {
        console.error(reason)
        setError('Ocurrio un error al cargar las aplicaciones.')
        setApps([])
        setSelectedPackage('')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  useEffect(() => {
    const handleMobileChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
      if (!event.matches) {
        setDetailsDrawerOpen(false)
      }
    }

    mobileModeQuery.addEventListener('change', handleMobileChange)
    return () => mobileModeQuery.removeEventListener('change', handleMobileChange)
  }, [])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  const filteredApps = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (value === '') {
      return apps
    }

    return apps.filter(app => (
      app.packageName.toLowerCase().includes(value)
      || app.title.toLowerCase().includes(value)
      || app.description.toLowerCase().includes(value)
      || app.author.toLowerCase().includes(value)
      || getExtensions(app).some(extension => extension.toLowerCase().includes(value))
    ))
  }, [apps, search])

  const selectedApp = useMemo(() => (
    apps.find(app => app.packageName === selectedPackage) ?? filteredApps[0] ?? null
  ), [apps, filteredApps, selectedPackage])

  useEffect(() => {
    if (!selectedApp) {
      setPermissions([])
      setPermissionsError('')
      setPermissionsLoading(false)
      setSources({} as LocalCloud.Sources)
      setSourcesError('')
      setSourcesLoading(false)
      return
    }

    let active = true
    setPermissionsLoading(true)
    setPermissionsError('')
    setSavingPermissions(new Set())

    window.sdk.permissions.get(selectedApp.packageName)
      .then(results => {
        if (!active) {
          return
        }

        setPermissions(results ?? [])
      })
      .catch(reason => {
        if (!active) {
          return
        }

        console.error(reason)
        setPermissions([])
        setPermissionsError('No se pudieron cargar los permisos.')
      })
      .finally(() => {
        if (active) {
          setPermissionsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedApp])

  useEffect(() => {
    if (!selectedApp) {
      return
    }

    let active = true
    setSourcesLoading(true)
    setSourcesError('')
    setSavingSources(new Set())

    window.sdk.sources.get(selectedApp.packageName)
      .then(results => {
        if (!active) {
          return
        }

        setSources((results ?? {}) as LocalCloud.Sources)
      })
      .catch(reason => {
        if (!active) {
          return
        }

        console.error(reason)
        setSources({} as LocalCloud.Sources)
        setSourcesError('No se pudieron cargar las fuentes.')
      })
      .finally(() => {
        if (active) {
          setSourcesLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedApp])

  const authorsCount = useMemo(() => (
    new Set(apps.map(app => app.author).filter(Boolean)).size
  ), [apps])

  const extensionsCount = useMemo(() => (
    new Set(apps.flatMap(getExtensions)).size
  ), [apps])

  const sourceGroups = useMemo<SourceGroup[]>(() => (
    sourceTypes
      .map(type => ({ type, sources: sources[type] ?? [] }))
      .filter(group => group.sources.length > 0)
  ), [sources])

  const sourcesCount = useMemo(() => (
    sourceGroups.reduce((total, group) => total + group.sources.length, 0)
  ), [sourceGroups])

  const setPermissionSaving = (permission: string, saving: boolean) => {
    setSavingPermissions(current => {
      const next = new Set(current)
      if (saving) {
        next.add(permission)
      } else {
        next.delete(permission)
      }
      return next
    })
  }

  const setSourceSaving = (sourceType: LocalCloud.SourceType, sourceId: number, saving: boolean) => {
    const key = getSourceKey(sourceType, sourceId)
    setSavingSources(current => {
      const next = new Set(current)
      if (saving) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  const handlePermissionChange = (permission: PermissionInfo, checked: boolean) => {
    if (!selectedApp || permission.enable === checked || selectedApp.packageName === currentPackageName) {
      return
    }

    setPermissionsError('')
    setPermissionSaving(permission.name, true)
    setPermissions(current => current.map(item => (
      item.name === permission.name ? { ...item, enable: checked } : item
    )))

    const request = checked
      ? window.sdk.permissions.enable(selectedApp.packageName, permission.name)
      : window.sdk.permissions.disable(selectedApp.packageName, permission.name)

    request
      .catch(reason => {
        console.error(reason)
        setPermissionsError('No se pudo actualizar el permiso.')
        setPermissions(current => current.map(item => (
          item.name === permission.name ? { ...item, enable: permission.enable } : item
        )))
      })
      .finally(() => setPermissionSaving(permission.name, false))
  }

  const handleSourceChange = (sourceType: LocalCloud.SourceType, source: SourceInfo, checked: boolean) => {
    if (!selectedApp || source.enable === checked || selectedApp.packageName === currentPackageName) {
      return
    }

    setSourcesError('')
    setSourceSaving(sourceType, source.id, true)
    setSources(current => ({
      ...current,
      [sourceType]: (current[sourceType] ?? []).map(item => (
        item.id === source.id ? { ...item, enable: checked } : item
      )),
    }))

    const request = checked
      ? window.sdk.sources.enable(selectedApp.packageName, sourceType, source.id)
      : window.sdk.sources.disable(selectedApp.packageName, sourceType, source.id)

    request
      .catch(reason => {
        console.error(reason)
        setSourcesError('No se pudo actualizar la fuente.')
        setSources(current => ({
          ...current,
          [sourceType]: (current[sourceType] ?? []).map(item => (
            item.id === source.id ? { ...item, enable: source.enable } : item
          )),
        }))
      })
      .finally(() => setSourceSaving(sourceType, source.id, false))
  }

  const handleAppSelect = (packageName: string) => {
    setSelectedPackage(packageName)
    if (isMobile) {
      setDetailsDrawerOpen(true)
    }
  }

  const handleChooseUpdate = () => {
    setUpdateTask(null)
    updateInputRef.current?.click()
  }

  const handleCancelUpdate = () => {
    updateUploadRef.current?.abort()
  }

  const handleUpdateFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !selectedApp || !canUpdateApps) {
      return
    }

    const task: UpdateTask = {
      packageName: selectedApp.packageName,
      fileName: file.name,
      status: 'uploading',
      loaded: 0,
      total: file.size,
      percent: 0,
      lengthComputable: file.size > 0,
    }
    setUpdateTask(task)

    const upload = window.sdk.apps.createUpdateUpload(selectedApp.packageName, file)
    updateUploadRef.current = upload

    upload.addEventListener('progress', progressEvent => {
      setUpdateTask(current => {
        if (!current || current.packageName !== selectedApp.packageName) {
          return current
        }

        return {
          ...current,
          status: 'uploading',
          loaded: progressEvent.detail.loaded,
          total: progressEvent.detail.total || file.size,
          percent: progressEvent.detail.lengthComputable ? progressEvent.detail.percent : current.percent,
          lengthComputable: progressEvent.detail.lengthComputable,
        }
      })
    })

    upload.start()
      .then(() => {
        setUpdateTask(current => current && current.packageName === selectedApp.packageName
          ? {
            ...current,
            status: 'complete',
            loaded: current.total || file.size,
            total: current.total || file.size,
            percent: 100,
            lengthComputable: true,
            message: 'Actualizacion instalada.',
          }
          : current)
        loadApps()
      })
      .catch(reason => {
        if (upload.aborted) {
          setUpdateTask(current => current && current.packageName === selectedApp.packageName
            ? { ...current, status: 'canceled', message: 'Actualizacion cancelada.' }
            : current)
          return
        }

        console.error(reason)
        setUpdateTask(current => current && current.packageName === selectedApp.packageName
          ? { ...current, status: 'error', message: 'No se pudo instalar la actualizacion.' }
          : current)
      })
      .finally(() => {
        if (updateUploadRef.current === upload) {
          updateUploadRef.current = null
        }
      })
  }

  const detailsContent = (
    <AppDetails
      app={selectedApp}
      currentPackageName={currentPackageName}
      permissions={permissions}
      permissionsExpanded={permissionsExpanded}
      permissionsLoading={permissionsLoading}
      permissionsError={permissionsError}
      savingPermissions={savingPermissions}
      sourcesExpanded={sourcesExpanded}
      sourcesLoading={sourcesLoading}
      sourcesError={sourcesError}
      sourceGroups={sourceGroups}
      sourcesCount={sourcesCount}
      savingSources={savingSources}
      canUpdate={canUpdateApps}
      updateTask={selectedApp && updateTask?.packageName === selectedApp.packageName ? updateTask : null}
      onPermissionsExpandedChange={setPermissionsExpanded}
      onSourcesExpandedChange={setSourcesExpanded}
      onPermissionChange={handlePermissionChange}
      onSourceChange={handleSourceChange}
      onChooseUpdate={handleChooseUpdate}
      onCancelUpdate={handleCancelUpdate}
    />
  )

  return (
    <FluentProvider theme={theme}>
        <main className={styles.page}>
          <div className={styles.shell}>
            <section className={styles.header}>
              <div className={styles.titleBlock}>
                <div className={styles.titleIcon}>
                  <AppsListDetailRegular />
                </div>
                <div>
                  <Title1>Apps</Title1>
                  <br />
                  <Body1>Gestiona las aplicaciones instaladas en LocalCloud.</Body1>
                </div>
              </div>

              <div className={styles.headerActions}>
                <Button
                  appearance="secondary"
                  icon={<ArrowClockwiseRegular />}
                  onClick={loadApps}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </div>
            </section>

            <section className={styles.stats}>
              <div className={styles.statPanel}>
                <Caption1>Instaladas</Caption1>
                <Text className={styles.statValue}>{apps.length}</Text>
              </div>
              <div className={styles.statPanel}>
                <Caption1>Autores</Caption1>
                <Text className={styles.statValue}>{authorsCount}</Text>
              </div>
              <div className={styles.statPanel}>
                <Caption1>Extensiones</Caption1>
                <Text className={styles.statValue}>{extensionsCount}</Text>
              </div>
            </section>

            <section className={styles.toolbar}>
              <Input
                className={styles.search}
                contentBefore={<SearchRegular />}
                placeholder="Buscar por app, paquete, autor o extension"
                value={search}
                onChange={(_, data) => setSearch(data.value)}
              />
              <Caption1>{filteredApps.length} de {apps.length} apps</Caption1>
            </section>

            {error && (
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {error}
                </MessageBarBody>
              </MessageBar>
            )}

            {loading ? (
              <div className={styles.center}>
                <Spinner size="huge" label="Cargando aplicaciones" />
              </div>
            ) : filteredApps.length === 0 ? (
              <div className={styles.emptyState}>
                <div>
                  <div className={styles.emptyHeader}>
                    <WarningRegular fontSize={28} />
                    <Subtitle2>No hay aplicaciones para mostrar.</Subtitle2>
                  </div>
                  <Body1>Prueba ajustando la busqueda o actualizando la lista.</Body1>
                </div>
              </div>
            ) : (
              <section className={styles.content}>
                <AppsGrid
                  apps={filteredApps}
                  selectedPackageName={selectedApp?.packageName ?? ''}
                  currentPackageName={currentPackageName}
                  onSelect={handleAppSelect}
                />

                <aside className={styles.details}>
                  <div className={styles.detailsHeader}>
                    <div>
                      <Caption1>Detalle de app</Caption1>
                      <br />
                      <Subtitle2>{selectedApp?.title || selectedApp?.packageName}</Subtitle2>
                    </div>
                  </div>

                  {detailsContent}
                </aside>

                <OverlayDrawer
                  className={styles.drawer}
                  open={detailsDrawerOpen}
                  position="end"
                  onOpenChange={(_, data) => setDetailsDrawerOpen(data.open)}
                >
                  <DrawerHeader>
                    <DrawerHeaderTitle
                      action={(
                        <Button
                          appearance="subtle"
                          aria-label="Cerrar detalle"
                          icon={<DismissRegular />}
                          onClick={() => setDetailsDrawerOpen(false)}
                        />
                      )}
                    >
                      {selectedApp?.title || selectedApp?.packageName || 'Detalle de app'}
                    </DrawerHeaderTitle>
                  </DrawerHeader>
                  <DrawerBody className={styles.drawerBody}>
                    <Caption1>Detalle de app</Caption1>
                    {detailsContent}
                  </DrawerBody>
                </OverlayDrawer>
              </section>
            )}
          </div>
          <input
            ref={updateInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className={styles.hiddenInput}
            onChange={handleUpdateFile}
          />
        </main>
    </FluentProvider>
  )
}

export default AppManager
