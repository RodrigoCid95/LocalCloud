import { type DragEvent, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Caption1,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Spinner,
  Subtitle2,
} from '@fluentui/react-components'
import {
  AddRegular,
  ArrowLeftRegular,
  DeleteRegular,
  EditRegular,
  FolderRegular,
  MusicNote2Regular,
  PlayRegular,
  SaveRegular,
  VideoRegular,
} from '@fluentui/react-icons'

import { getFileName, getSupportedFiles, joinPath } from '../media'
import { createPlaylistId, loadPlaylists, savePlaylists } from '../playlists'
import { useStyles } from '../styles'
import type { MediaInfo, PlaybackSource, PlaylistItem, SavedPlaylist } from '../types'

type PlaylistLibraryProps = {
  open: boolean
  currentItems: PlaylistItem[]
  onOpenChange: (open: boolean) => void
  onPlayItems: (items: PlaylistItem[], startIndex?: number, source?: PlaybackSource) => void
}

type LibraryMode = 'list' | 'edit'

const getParentPath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return segments.slice(0, -1).join('/')
}

const getItemIcon = (media: MediaInfo) => (
  media.kind === 'audio' ? <MusicNote2Regular /> : <VideoRegular />
)

const PlaylistLibrary = ({
  open,
  currentItems,
  onOpenChange,
  onPlayItems,
}: PlaylistLibraryProps) => {
  const styles = useStyles()
  const [mode, setMode] = useState<LibraryMode>('list')
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([])
  const [editingId, setEditingId] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftItems, setDraftItems] = useState<PlaylistItem[]>([])
  const [root, setRoot] = useState<LocalCloud.FileSystemRoot>('user')
  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<LocalCloud.FileSystemEntry[]>([])
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [browserLoading, setBrowserLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const supportedFiles = useMemo(
    () => getSupportedFiles(root, path, entries),
    [entries, path, root],
  )
  const selectedFiles = useMemo(
    () => supportedFiles.filter(item => selectedPaths.includes(item.path)),
    [selectedPaths, supportedFiles],
  )
  const canSaveDraft = draftName.trim() !== '' && draftItems.length > 0

  const refresh = () => {
    setLoading(true)
    setError('')
    loadPlaylists()
      .then(setPlaylists)
      .catch(reason => {
        console.error(reason)
        setPlaylists([])
        setError('No se pudieron cargar las listas.')
      })
      .finally(() => setLoading(false))
  }

  const loadFolder = (nextRoot: LocalCloud.FileSystemRoot, nextPath: string) => {
    setRoot(nextRoot)
    setPath(nextPath)
    setSelectedPaths([])
    setBrowserLoading(true)
    setError('')

    window.sdk.filesystem.readDir(nextRoot, nextPath)
      .then(results => {
        if (results === null) {
          setEntries([])
          setError('No se pudo abrir la carpeta.')
          return
        }

        setEntries(results)
      })
      .catch(reason => {
        console.error(reason)
        setEntries([])
        setError('Ocurrio un error al cargar la carpeta.')
      })
      .finally(() => setBrowserLoading(false))
  }

  useEffect(() => {
    if (open) {
      refresh()
      setMode('list')
    }
  }, [open])

  const persist = (nextPlaylists: SavedPlaylist[]) => {
    setSaving(true)
    setError('')
    savePlaylists(nextPlaylists)
      .then(() => {
        setPlaylists(nextPlaylists)
        setMode('list')
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudieron guardar los cambios.')
      })
      .finally(() => setSaving(false))
  }

  const startCreate = (items: PlaylistItem[] = []) => {
    setEditingId('')
    setDraftName('')
    setDraftItems(items)
    setSelectedPaths([])
    setMode('edit')
    loadFolder('user', '')
  }

  const startEdit = (playlist: SavedPlaylist) => {
    setEditingId(playlist.id)
    setDraftName(playlist.name)
    setDraftItems(playlist.items)
    setSelectedPaths([])
    setMode('edit')
    loadFolder(playlist.items[0]?.root || 'user', '')
  }

  const saveDraft = () => {
    if (!canSaveDraft) {
      return
    }

    const now = new Date().toISOString()
    if (editingId) {
      persist(playlists.map(playlist => (
        playlist.id === editingId
          ? { ...playlist, name: draftName.trim(), items: draftItems, updatedAt: now }
          : playlist
      )))
      return
    }

    persist([{
      id: createPlaylistId(),
      name: draftName.trim(),
      items: draftItems,
      createdAt: now,
      updatedAt: now,
    }, ...playlists])
  }

  const deletePlaylist = (playlist: SavedPlaylist) => {
    persist(playlists.filter(item => item.id !== playlist.id))
  }

  const playPlaylist = (playlist: SavedPlaylist) => {
    onPlayItems(playlist.items, 0, { kind: 'playlist', name: playlist.name })
    onOpenChange(false)
  }

  const toggleSelected = (item: PlaylistItem) => {
    setSelectedPaths(current => (
      current.includes(item.path)
        ? current.filter(path => path !== item.path)
        : [...current, item.path]
    ))
  }

  const addSelected = () => {
    setDraftItems(current => {
      const existing = new Set(current.map(item => `${item.root}:${item.path}`))
      const next = [...current]
      for (const item of selectedFiles) {
        const key = `${item.root}:${item.path}`
        if (!existing.has(key)) {
          next.push(item)
          existing.add(key)
        }
      }
      return next
    })
    setSelectedPaths([])
  }

  const removeDraftItem = (index: number) => {
    setDraftItems(current => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const moveDraftItem = (index: number, nextIndex: number) => {
    setDraftItems(current => {
      if (index === nextIndex || nextIndex < 0 || nextIndex >= current.length) {
        return current
      }

      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(nextIndex, 0, item)
      return next
    })
  }

  const startDraftDrag = (event: DragEvent<HTMLElement>, index: number) => {
    setDraggingIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }

  const dragOverDraftItem = (event: DragEvent<HTMLElement>, index: number) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (draggingIndex === null || draggingIndex === index) {
      return
    }

    moveDraftItem(draggingIndex, index)
    setDraggingIndex(index)
  }

  const endDraftDrag = () => {
    setDraggingIndex(null)
  }

  const renderList = () => (
    <>
      <div className={styles.libraryActions}>
        <Button appearance="primary" icon={<AddRegular />} onClick={() => startCreate()}>
          Crear lista
        </Button>
        <Button
          icon={<SaveRegular />}
          disabled={currentItems.length === 0}
          onClick={() => startCreate(currentItems)}
        >
          Crear con reproduccion actual
        </Button>
      </div>

      {loading ? (
        <div className={styles.folderLoading}>
          <Spinner label="Cargando listas" />
        </div>
      ) : (
        <div className={styles.libraryList}>
          {playlists.map(playlist => (
            <article className={styles.libraryRow} key={playlist.id}>
              <div className={styles.libraryInfo}>
                <Subtitle2>{playlist.name}</Subtitle2>
                <div className={styles.meta}>
                  <Badge appearance="tint">{playlist.items.length} archivos</Badge>
                  <Caption1>{new Date(playlist.updatedAt).toLocaleString()}</Caption1>
                </div>
              </div>
              <div className={styles.libraryActions}>
                <Button
                  appearance="primary"
                  icon={<PlayRegular />}
                  disabled={playlist.items.length === 0}
                  onClick={() => playPlaylist(playlist)}
                >
                  Reproducir
                </Button>
                <Button icon={<EditRegular />} onClick={() => startEdit(playlist)}>
                  Editar
                </Button>
                <Button
                  appearance="secondary"
                  icon={<DeleteRegular />}
                  disabled={saving}
                  onClick={() => deletePlaylist(playlist)}
                >
                  Borrar
                </Button>
              </div>
            </article>
          ))}
          {playlists.length === 0 && (
            <Caption1>No hay listas guardadas todavia.</Caption1>
          )}
        </div>
      )}
    </>
  )

  const renderEditor = () => (
    <>
      <Field label="Nombre de la lista">
        <Input
          value={draftName}
          disabled={saving}
          placeholder="Mi lista"
          onChange={(_, data) => setDraftName(data.value)}
        />
      </Field>

      <div className={styles.libraryEditorGrid}>
        <section className={styles.libraryColumn}>
          <div className={styles.folderToolbar}>
            <Button
              icon={<ArrowLeftRegular />}
              disabled={path === ''}
              onClick={() => loadFolder(root, getParentPath(path))}
            >
              Subir
            </Button>
            <Caption1 className={styles.pathLabel}>/{path}</Caption1>
          </div>

          <div className={styles.rootSelector}>
            <Button appearance={root === 'shared' ? 'primary' : 'secondary'} onClick={() => loadFolder('shared', '')}>
              Compartido
            </Button>
            <Button appearance={root === 'user' ? 'primary' : 'secondary'} onClick={() => loadFolder('user', '')}>
              Usuario
            </Button>
          </div>

          {browserLoading ? (
            <div className={styles.folderLoading}>
              <Spinner label="Cargando carpeta" />
            </div>
          ) : (
            <div className={styles.entryList}>
              {entries
                .filter(entry => entry.type === 'directory')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(entry => (
                  <button
                    key={`dir-${entry.name}`}
                    className={styles.entryRow}
                    type="button"
                    onClick={() => loadFolder(root, joinPath(path, entry.name))}
                  >
                    <span className={styles.entryIcon}><FolderRegular /></span>
                    <span>{entry.name}</span>
                  </button>
                ))}
              {supportedFiles.map(item => (
                <div className={styles.selectableRow} key={item.path}>
                  <Checkbox
                    checked={selectedPaths.includes(item.path)}
                    onChange={() => toggleSelected(item)}
                  />
                  <span className={styles.entryIcon}>{getItemIcon(item.media)}</span>
                  <span>{getFileName(item.path)}</span>
                </div>
              ))}
              {entries.length > 0 && supportedFiles.length === 0 && (
                <Caption1>No hay archivos reproducibles en esta carpeta.</Caption1>
              )}
            </div>
          )}

          <Button
            appearance="primary"
            icon={<AddRegular />}
            disabled={selectedFiles.length === 0}
            onClick={addSelected}
          >
            Agregar seleccionados
          </Button>
        </section>

        <section className={styles.libraryColumn}>
          <div className={styles.playlistHeader}>
            <Subtitle2>Orden de reproduccion</Subtitle2>
            <Badge appearance="tint">{draftItems.length} archivos</Badge>
          </div>
          <div className={styles.libraryDraftList}>
            {draftItems.map((item, index) => (
              <article
                className={`${styles.draftRow} ${draggingIndex === index ? styles.draftRowDragging : ''}`}
                draggable
                key={`${item.root}-${item.path}-${index}`}
                onDragStart={event => startDraftDrag(event, index)}
                onDragOver={event => dragOverDraftItem(event, index)}
                onDragEnd={endDraftDrag}
                onDrop={endDraftDrag}
              >
                <span className={styles.entryIcon}>{getItemIcon(item.media)}</span>
                <div className={styles.trackInfo}>
                  <span className={styles.trackName}>{getFileName(item.path)}</span>
                  <Caption1 className={styles.trackPath}>{item.path}</Caption1>
                </div>
                <div className={styles.draftActions}>
                  <Button size="small" icon={<DeleteRegular />} onClick={() => removeDraftItem(index)} />
                </div>
              </article>
            ))}
            {draftItems.length === 0 && (
              <Caption1>Selecciona archivos del explorador para construir esta lista.</Caption1>
            )}
          </div>
        </section>
      </div>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.librarySurface}>
        <DialogBody>
          <DialogTitle>
            {mode === 'edit' ? 'Editar lista de reproduccion' : 'Listas de reproduccion'}
          </DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}
            {mode === 'edit' ? renderEditor() : renderList()}
          </DialogContent>
          <DialogActions>
            {mode === 'edit' && (
              <Button appearance="secondary" onClick={() => setMode('list')}>
                Volver
              </Button>
            )}
            {mode === 'edit' && (
              <Button appearance="primary" icon={<SaveRegular />} disabled={!canSaveDraft || saving} onClick={saveDraft}>
                Guardar
              </Button>
            )}
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default PlaylistLibrary
