import { Fragment, type ChangeEvent, type DragEvent, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  FluentProvider,
  Input,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  ProgressBar,
  Spinner,
  Subtitle2,
  Switch,
  Title1,
  Tooltip,
  OverlayDrawer,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  ArrowClockwiseRegular,
  ChevronRightRegular,
  DismissRegular,
  DocumentRegular,
  EditRegular,
  FolderAddRegular,
  FolderOpenRegular,
  FolderRegular,
  HomeRegular,
  ShareRegular,
  StorageRegular,
} from '@fluentui/react-icons'

import { FilesList } from './components/FilesList'
import { useStyles } from './styles'
import type { TransferTask } from './types'
import { formatBytes, joinPath } from './utils'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const preferencesKey = 'preferences'

type FilesPreferences = {
  showHiddenFiles?: boolean
}

const AppManager = () => {
  const styles = useStyles()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const uploadTasksRef = useRef<Record<string, LocalCloud.FileSystemUpload>>({})
  const downloadTasksRef = useRef<Record<string, LocalCloud.FileSystemDownload>>({})
  const dragDepthRef = useRef<number>(0)
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [root, setRoot] = useState<LocalCloud.FileSystemRoot>('user')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [entries, setEntries] = useState<LocalCloud.FileSystemEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [busy, setBusy] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false)
  const [entryToRename, setEntryToRename] = useState<LocalCloud.FileSystemEntry | null>(null)
  const [tasksOpen, setTasksOpen] = useState<boolean>(false)
  const [newFolderName, setNewFolderName] = useState<string>('')
  const [renameValue, setRenameValue] = useState<string>('')
  const [transferTasks, setTransferTasks] = useState<TransferTask[]>([])
  const [draggingFiles, setDraggingFiles] = useState<boolean>(false)
  const [showHiddenFiles, setShowHiddenFiles] = useState<boolean>(false)

  const loadEntries = useCallback(() => {
    setLoading(true)
    setError('')

    window.sdk.filesystem.readDir(root, currentPath)
      .then(results => {
        if (results === null) {
          setError('No se pudo abrir la carpeta.')
          setEntries([])
          return
        }

        setEntries(results)
      })
      .catch(reason => {
        console.error(reason)
        setError('Ocurrio un error al cargar los archivos.')
        setEntries([])
      })
      .finally(() => setLoading(false))
  }, [currentPath, root])

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    window.sdk.data.user.get<FilesPreferences | null>(preferencesKey)
      .then(preferences => {
        setShowHiddenFiles(preferences?.showHiddenFiles === true)
      })
      .catch(reason => {
        console.error(reason)
      })
  }, [])

  const sortedEntries = useMemo(() => (
    entries.filter(entry => showHiddenFiles || !entry.name.startsWith('.')).sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  ), [entries, showHiddenFiles])

  const breadcrumbs = useMemo(() => {
    const segments = currentPath.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      name: segment,
      path: segments.slice(0, index + 1).join('/'),
    }))
  }, [currentPath])

  const activeTaskCount = useMemo(() => (
    transferTasks.filter(task => task.status === 'uploading' || task.status === 'downloading').length
  ), [transferTasks])

  const updateTask = (id: string, updater: (task: TransferTask) => TransferTask) => {
    setTransferTasks(current => current.map(task => (
      task.id === id ? updater(task) : task
    )))
  }

  const openRoot = (nextRoot: LocalCloud.FileSystemRoot) => {
    setRoot(nextRoot)
    setCurrentPath('')
    setError('')
  }

  const openDirectory = (name: string) => {
    setCurrentPath(path => joinPath(path, name))
  }

  const openFile = (name: string) => {
    const path = joinPath(currentPath, name)
    window.open(window.sdk.filesystem.getFileUrl(root, path), '_blank', 'noopener')
  }

  const downloadFile = (name: string) => {
    const path = joinPath(currentPath, name)
    setError('')
    setTasksOpen(true)

    const taskId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTransferTasks(current => [{
      id: taskId,
      kind: 'download',
      name,
      path,
      status: 'downloading',
      loaded: 0,
      total: 0,
      percent: 0,
      lengthComputable: false,
    }, ...current])

    const download = window.sdk.filesystem.createDownload(root, path)
    downloadTasksRef.current[taskId] = download

    download.addEventListener('progress', event => {
      updateTask(taskId, task => ({
        ...task,
        status: 'downloading',
        loaded: event.detail.loaded,
        total: event.detail.total,
        percent: event.detail.lengthComputable ? event.detail.percent : task.percent,
        lengthComputable: event.detail.lengthComputable,
      }))
    })
    download.addEventListener('pause', () => {
      updateTask(taskId, task => ({
        ...task,
        status: 'paused',
      }))
    })
    download.addEventListener('resume', () => {
      updateTask(taskId, task => ({
        ...task,
        status: 'downloading',
      }))
    })
    download.addEventListener('cancel', () => {
      updateTask(taskId, task => ({
        ...task,
        status: 'canceled',
        message: 'Descarga cancelada',
      }))
    })
    download.addEventListener('complete', () => {
      updateTask(taskId, task => ({
        ...task,
        status: 'complete',
        loaded: task.total || download.loaded,
        total: task.total || download.total,
        percent: 100,
      }))
      delete downloadTasksRef.current[taskId]
      download.save(name)
    })

    download.start()
      .catch(reason => {
        if (download.canceled) {
          return
        }

        console.error(reason)
        updateTask(taskId, task => ({
          ...task,
          status: 'error',
          message: 'No se pudo descargar el archivo.',
        }))
        delete downloadTasksRef.current[taskId]
      })
  }

  const deleteEntry = (entry: LocalCloud.FileSystemEntry) => {
    const entryType = entry.type === 'directory' ? 'la carpeta' : 'el archivo'
    const ok = window.confirm(`Eliminar ${entryType} "${entry.name}"?`)
    if (!ok) {
      return
    }

    setBusy(true)
    setError('')

    window.sdk.filesystem.delete(root, joinPath(currentPath, entry.name))
      .then(loadEntries)
      .catch(reason => {
        console.error(reason)
        setError(`No se pudo eliminar ${entryType}.`)
      })
      .finally(() => setBusy(false))
  }

  const openRenameDialog = (entry: LocalCloud.FileSystemEntry) => {
    setEntryToRename(entry)
    setRenameValue(entry.name)
    setError('')
  }

  const closeRenameDialog = () => {
    setEntryToRename(null)
    setRenameValue('')
  }

  const handleRenameEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!entryToRename) {
      return
    }

    const newName = renameValue.trim()
    if (newName === '' || newName === entryToRename.name || newName.includes('/') || newName.includes('\\')) {
      setError('El nuevo nombre no es valido.')
      return
    }

    setBusy(true)
    setError('')

    window.sdk.filesystem.rename(root, joinPath(currentPath, entryToRename.name), newName)
      .then(() => {
        closeRenameDialog()
        loadEntries()
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudo renombrar el elemento.')
      })
      .finally(() => setBusy(false))
  }

  const handleCreateFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const folderName = newFolderName.trim()
    if (folderName === '') {
      setError('El nombre de la carpeta es requerido.')
      return
    }

    setBusy(true)
    setError('')

    window.sdk.filesystem.createDir(root, joinPath(currentPath, folderName))
      .then(() => {
        setCreateDialogOpen(false)
        setNewFolderName('')
        loadEntries()
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudo crear la carpeta.')
      })
      .finally(() => setBusy(false))
  }

  const uploadFile = (file: File) => {
    setError('')
    setTasksOpen(true)

    const path = joinPath(currentPath, file.name)
    const taskId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTransferTasks(current => [{
      id: taskId,
      kind: 'upload',
      name: file.name,
      path,
      status: 'uploading',
      loaded: 0,
      total: file.size,
      percent: 0,
      lengthComputable: file.size > 0,
    }, ...current])

    const upload = window.sdk.filesystem.createUpload(root, path, file, file.type || undefined)
    uploadTasksRef.current[taskId] = upload

    upload.addEventListener('progress', event => {
      updateTask(taskId, task => ({
        ...task,
        status: 'uploading',
        loaded: event.detail.loaded,
        total: event.detail.total || file.size,
        percent: event.detail.lengthComputable ? event.detail.percent : task.percent,
        lengthComputable: event.detail.lengthComputable,
      }))
    })

    upload.addEventListener('complete', () => {
      updateTask(taskId, task => ({
        ...task,
        status: 'complete',
        loaded: task.total || file.size,
        total: task.total || file.size,
        percent: 100,
      }))
    })

    upload.start()
      .then(() => loadEntries())
      .catch(reason => {
        if (upload.aborted) {
          updateTask(taskId, task => ({
            ...task,
            status: 'canceled',
            message: 'Carga cancelada',
          }))
          return
        }

        console.error(reason)
        updateTask(taskId, task => ({
          ...task,
          status: 'error',
          message: 'No se pudo subir el archivo.',
        }))
      })
      .finally(() => {
        delete uploadTasksRef.current[taskId]
      })
  }

  const uploadFiles = (files: File[]) => {
    if (files.length === 0) {
      return
    }

    files.forEach(uploadFile)
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    uploadFiles(files)
  }

  const hasDraggedFiles = (event: DragEvent<HTMLElement>) => (
    Array.from(event.dataTransfer.types).includes('Files')
  )

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!hasDraggedFiles(event)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current += 1
    setDraggingFiles(true)
  }

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!hasDraggedFiles(event)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setDraggingFiles(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!hasDraggedFiles(event)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setDraggingFiles(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!hasDraggedFiles(event)) {
      return
    }

    event.preventDefault()
    dragDepthRef.current = 0
    setDraggingFiles(false)
    uploadFiles(Array.from(event.dataTransfer.files))
  }

  const cancelUpload = (taskId: string) => {
    uploadTasksRef.current[taskId]?.abort()
  }

  const pauseDownload = (taskId: string) => {
    downloadTasksRef.current[taskId]?.pause()
  }

  const resumeDownload = (taskId: string) => {
    const download = downloadTasksRef.current[taskId]
    if (!download) {
      return
    }

    download.resume().catch(reason => {
      console.error(reason)
      updateTask(taskId, task => ({
        ...task,
        status: 'error',
        message: 'No se pudo reanudar la descarga.',
      }))
    })
  }

  const cancelDownload = (taskId: string) => {
    downloadTasksRef.current[taskId]?.cancel()
    delete downloadTasksRef.current[taskId]
  }

  const clearFinishedTasks = () => {
    setTransferTasks(current => current.filter(task => (
      task.status === 'uploading' || task.status === 'downloading' || task.status === 'paused'
    )))
  }

  const updateShowHiddenFiles = (checked: boolean) => {
    setShowHiddenFiles(checked)
    window.sdk.data.user.set(preferencesKey, { showHiddenFiles: checked }).catch(reason => {
      console.error(reason)
      setError('No se pudo guardar la preferencia de archivos ocultos.')
    })
  }

  return (
    <FluentProvider theme={theme}>
        <main
          className={styles.page}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {draggingFiles && (
            <div className={styles.dropOverlay}>
              <div className={styles.dropMessage}>
                <Subtitle2>Suelta los archivos para subirlos</Subtitle2>
                <Caption1>Se cargaran en la carpeta actual.</Caption1>
              </div>
            </div>
          )}
          <div className={styles.shell}>
            <header className={styles.header}>
              <div className={styles.titleBlock}>
                <div className={styles.titleIcon}>
                  <StorageRegular />
                </div>
                <div>
                  <Title1>Archivos</Title1>
                  <br />
                  <Body1>Carpeta {root === 'shared' ? 'compartida' : 'personal'}</Body1>
                </div>
              </div>
              <div className={styles.headerActions}>
                <div className={styles.roots}>
                  <Button
                    appearance={root === 'shared' ? 'primary' : 'secondary'}
                    icon={<ShareRegular />}
                    onClick={() => openRoot('shared')}
                  >
                    Compartida
                  </Button>
                  <Button
                    appearance={root === 'user' ? 'primary' : 'secondary'}
                    icon={<HomeRegular />}
                    onClick={() => openRoot('user')}
                  >
                    Personal
                  </Button>
                </div>
                <Tooltip content="Actualizar" relationship="label">
                  <Button
                    appearance="secondary"
                    icon={<ArrowClockwiseRegular />}
                    disabled={loading}
                    onClick={loadEntries}
                  />
                </Tooltip>
                <Button
                  appearance="secondary"
                  onClick={() => setTasksOpen(true)}
                >
                  Tareas
                  {activeTaskCount > 0 && <Badge appearance="filled" color="brand">{activeTaskCount}</Badge>}
                </Button>
              </div>
            </header>

            {error && (
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {error}
                </MessageBarBody>
              </MessageBar>
            )}

            <section className={styles.toolbar}>
              <nav className={styles.breadcrumbs} aria-label="Ruta actual">
                <Button
                  className={styles.crumbButton}
                  appearance="transparent"
                  icon={<FolderOpenRegular />}
                  onClick={() => setCurrentPath('')}
                >
                  Inicio
                </Button>
                {breadcrumbs.map(crumb => (
                  <Fragment key={crumb.path}>
                    <ChevronRightRegular />
                    <Button
                      className={styles.crumbButton}
                      appearance="transparent"
                      onClick={() => setCurrentPath(crumb.path)}
                    >
                      {crumb.name}
                    </Button>
                  </Fragment>
                ))}
              </nav>
              <div className={styles.actions}>
                <Switch
                  checked={showHiddenFiles}
                  label="Mostrar ocultos"
                  onChange={(_, data) => updateShowHiddenFiles(data.checked)}
                />
                <input
                  ref={uploadInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  multiple
                  onChange={handleUpload}
                />
                <Button
                  appearance="secondary"
                  icon={<FolderAddRegular />}
                  disabled={busy}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Nueva carpeta
                </Button>
                <Button
                  appearance="primary"
                  disabled={busy}
                  onClick={() => uploadInputRef.current?.click()}
                >
                  Subir archivo
                </Button>
              </div>
            </section>

            <FilesList
              entries={sortedEntries}
              loading={loading}
              busy={busy}
              onOpenDirectory={openDirectory}
              onOpenFile={openFile}
              onDownloadFile={downloadFile}
              onRenameEntry={openRenameDialog}
              onDeleteEntry={deleteEntry}
            />
          </div>

          <OverlayDrawer
            open={tasksOpen}
            position="end"
            onOpenChange={(_, data) => setTasksOpen(data.open)}
          >
            <DrawerHeader>
              <DrawerHeaderTitle
                action={(
                  <Button
                    appearance="subtle"
                    aria-label="Cerrar tareas"
                    icon={<DismissRegular />}
                    onClick={() => setTasksOpen(false)}
                  />
                )}
              >
                Tareas
              </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
              {transferTasks.length === 0 ? (
                <div className={styles.drawerEmpty}>
                  <div>
                    <Subtitle2>No hay tareas</Subtitle2>
                    <Caption1>Las subidas y descargas apareceran aqui.</Caption1>
                  </div>
                </div>
              ) : (
                <div className={styles.taskList}>
                  <div className={styles.taskActions}>
                    <Caption1>{activeTaskCount} tareas activas</Caption1>
                    <Button
                      appearance="secondary"
                      disabled={transferTasks.every(task => (
                        task.status === 'uploading' || task.status === 'downloading' || task.status === 'paused'
                      ))}
                      onClick={clearFinishedTasks}
                    >
                      Limpiar terminadas
                    </Button>
                  </div>
                  {transferTasks.map(task => (
                    <article className={styles.taskPanel} key={task.id}>
                      <div className={styles.taskHeader}>
                        <div className={styles.taskInfo}>
                          <Subtitle2 className={styles.truncate}>
                            {task.kind === 'download' ? 'Descarga' : 'Subida'}: {task.name}
                          </Subtitle2>
                          <Caption1 className={styles.truncate}>{task.path}</Caption1>
                        </div>
                        {task.kind === 'upload' && task.status === 'uploading' && (
                          <Button appearance="secondary" onClick={() => cancelUpload(task.id)}>
                            Cancelar
                          </Button>
                        )}
                        {task.kind === 'download' && task.status === 'downloading' && (
                          <div className={styles.rowActions}>
                            <Button appearance="secondary" onClick={() => pauseDownload(task.id)}>
                              Pausar
                            </Button>
                            <Button appearance="secondary" onClick={() => cancelDownload(task.id)}>
                              Cancelar
                            </Button>
                          </div>
                        )}
                        {task.kind === 'download' && task.status === 'paused' && (
                          <div className={styles.rowActions}>
                            <Button appearance="primary" onClick={() => resumeDownload(task.id)}>
                              Reanudar
                            </Button>
                            <Button appearance="secondary" onClick={() => cancelDownload(task.id)}>
                              Cancelar
                            </Button>
                          </div>
                        )}
                        {task.status === 'complete' && <Badge appearance="filled" color="success">Completado</Badge>}
                        {task.status === 'error' && <Badge appearance="filled" color="danger">Error</Badge>}
                        {task.status === 'canceled' && <Badge appearance="filled" color="warning">Cancelado</Badge>}
                      </div>
                      <ProgressBar value={task.lengthComputable ? task.percent / 100 : undefined} />
                      <Caption1 className={styles.taskMeta}>
                        {task.status === 'error' || task.status === 'canceled'
                          ? task.message
                          : task.lengthComputable
                            ? `${task.percent}% · ${formatBytes(task.loaded)} de ${formatBytes(task.total)}`
                            : `${formatBytes(task.loaded)} ${task.kind === 'download' ? 'descargados' : 'subidos'}`}
                      </Caption1>
                    </article>
                  ))}
                </div>
              )}
            </DrawerBody>
          </OverlayDrawer>

          <Dialog
            open={createDialogOpen}
            onOpenChange={(_, data) => !busy && setCreateDialogOpen(data.open)}
          >
            <DialogSurface>
              <form onSubmit={handleCreateFolder}>
                <DialogBody>
                  <DialogTitle>Nueva carpeta</DialogTitle>
                  <DialogContent>
                    <div className={styles.dialogForm}>
                      <Field label="Nombre" required>
                        <Input
                          value={newFolderName}
                          disabled={busy}
                          contentBefore={<FolderRegular />}
                          onChange={(_, data) => setNewFolderName(data.value)}
                        />
                      </Field>
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      appearance="secondary"
                      disabled={busy}
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      appearance="primary"
                      disabled={busy}
                      icon={busy ? undefined : <FolderAddRegular />}
                      type="submit"
                    >
                      {busy ? <Spinner size="tiny" label="Creando" /> : 'Crear'}
                    </Button>
                  </DialogActions>
                </DialogBody>
              </form>
            </DialogSurface>
          </Dialog>

          <Dialog
            open={entryToRename !== null}
            onOpenChange={(_, data) => !busy && !data.open && closeRenameDialog()}
          >
            <DialogSurface>
              <form onSubmit={handleRenameEntry}>
                <DialogBody>
                  <DialogTitle>Renombrar elemento</DialogTitle>
                  <DialogContent>
                    <div className={styles.dialogForm}>
                      <Field label="Nuevo nombre" required>
                        <Input
                          value={renameValue}
                          disabled={busy}
                          contentBefore={entryToRename?.type === 'directory' ? <FolderRegular /> : <DocumentRegular />}
                          onChange={(_, data) => setRenameValue(data.value)}
                        />
                      </Field>
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      appearance="secondary"
                      disabled={busy}
                      onClick={closeRenameDialog}
                    >
                      Cancelar
                    </Button>
                    <Button
                      appearance="primary"
                      disabled={busy}
                      icon={busy ? undefined : <EditRegular />}
                      type="submit"
                    >
                      {busy ? <Spinner size="tiny" label="Renombrando" /> : 'Renombrar'}
                    </Button>
                  </DialogActions>
                </DialogBody>
              </form>
            </DialogSurface>
          </Dialog>
        </main>
    </FluentProvider>
  )
}

export default AppManager
