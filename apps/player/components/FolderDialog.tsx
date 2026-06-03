import { useEffect, useMemo, useState } from 'react'
import {
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components'
import {
  ArrowLeftRegular,
  FolderRegular,
  MusicNote2Regular,
  VideoRegular,
} from '@fluentui/react-icons'

import { getFileName, getSupportedFiles, joinPath } from '../media'
import { useStyles } from '../styles'
import type { MediaInfo, PlaybackSource, PlaylistItem } from '../types'

type FolderDialogProps = {
  open: boolean
  initialRoot: LocalCloud.FileSystemRoot
  initialPath: string
  onOpenChange: (open: boolean) => void
  onPlayItems: (items: PlaylistItem[], startIndex?: number, source?: PlaybackSource) => void
}

const getParentPath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return segments.slice(0, -1).join('/')
}

const getItemIcon = (media: MediaInfo) => (
  media.kind === 'audio' ? <MusicNote2Regular /> : <VideoRegular />
)

const FolderDialog = ({
  open,
  initialRoot,
  initialPath,
  onOpenChange,
  onPlayItems,
}: FolderDialogProps) => {
  const styles = useStyles()
  const [folderRoot, setFolderRoot] = useState<LocalCloud.FileSystemRoot>(initialRoot)
  const [folderPath, setFolderPath] = useState(initialPath)
  const [folderEntries, setFolderEntries] = useState<LocalCloud.FileSystemEntry[]>([])
  const [folderLoading, setFolderLoading] = useState(false)
  const [folderError, setFolderError] = useState('')

  const supportedFolderFiles = useMemo(
    () => getSupportedFiles(folderRoot, folderPath, folderEntries),
    [folderEntries, folderPath, folderRoot],
  )

  const loadFolder = (root: LocalCloud.FileSystemRoot, path: string) => {
    setFolderRoot(root)
    setFolderPath(path)
    setFolderLoading(true)
    setFolderError('')

    window.sdk.filesystem.readDir(root, path)
      .then(entries => {
        if (entries === null) {
          setFolderEntries([])
          setFolderError('No se pudo abrir la carpeta.')
          return
        }

        setFolderEntries(entries)
      })
      .catch(reason => {
        console.error(reason)
        setFolderEntries([])
        setFolderError('Ocurrio un error al cargar la carpeta.')
      })
      .finally(() => setFolderLoading(false))
  }

  useEffect(() => {
    if (open) {
      loadFolder(initialRoot, initialPath)
    }
  }, [initialPath, initialRoot, open])

  const playFolder = () => {
    onPlayItems(supportedFolderFiles, 0, {
      kind: 'folder',
      name: folderPath ? `/${folderPath}` : folderRoot,
    })
    onOpenChange(false)
  }

  const playFromFile = (item: PlaylistItem) => {
    const index = supportedFolderFiles.findIndex(file => file.path === item.path)
    onPlayItems(supportedFolderFiles, Math.max(index, 0), {
      kind: 'folder',
      name: folderPath ? `/${folderPath}` : folderRoot,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Abrir carpeta</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.rootSelector}>
              <Button
                appearance={folderRoot === 'shared' ? 'primary' : 'secondary'}
                onClick={() => loadFolder('shared', '')}
              >
                Compartido
              </Button>
              <Button
                appearance={folderRoot === 'user' ? 'primary' : 'secondary'}
                onClick={() => loadFolder('user', '')}
              >
                Usuario
              </Button>
            </div>

            <div className={styles.folderToolbar}>
              <Button
                icon={<ArrowLeftRegular />}
                disabled={folderPath === ''}
                onClick={() => loadFolder(folderRoot, getParentPath(folderPath))}
              >
                Subir
              </Button>
              <Body1 className={styles.pathLabel}>/{folderPath}</Body1>
            </div>

            {folderError && (
              <MessageBar intent="error">
                <MessageBarBody>{folderError}</MessageBarBody>
              </MessageBar>
            )}

            {folderLoading ? (
              <div className={styles.folderLoading}>
                <Spinner label="Cargando carpeta" />
              </div>
            ) : (
              <div className={styles.entryList}>
                {folderEntries
                  .filter(entry => entry.type === 'directory')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(entry => (
                    <button
                      key={`dir-${entry.name}`}
                      className={styles.entryRow}
                      type="button"
                      onClick={() => loadFolder(folderRoot, joinPath(folderPath, entry.name))}
                    >
                      <span className={styles.entryIcon}><FolderRegular /></span>
                      <span>{entry.name}</span>
                    </button>
                  ))}
                {supportedFolderFiles.map(item => (
                  <button
                    key={`file-${item.path}`}
                    className={styles.entryRow}
                    type="button"
                    onClick={() => playFromFile(item)}
                  >
                    <span className={styles.entryIcon}>{getItemIcon(item.media)}</span>
                    <span>{getFileName(item.path)}</span>
                  </button>
                ))}
                {folderEntries.length === 0 && (
                  <Caption1>Esta carpeta esta vacia.</Caption1>
                )}
                {folderEntries.length > 0 && supportedFolderFiles.length === 0 && (
                  <Caption1>No hay archivos reproducibles en esta carpeta.</Caption1>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              appearance="primary"
              disabled={folderLoading || supportedFolderFiles.length === 0}
              onClick={playFolder}
            >
              Reproducir carpeta
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default FolderDialog
