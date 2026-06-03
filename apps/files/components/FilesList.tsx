import {
  Badge,
  Button,
  Caption1,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Spinner,
  Subtitle2,
  mergeClasses,
} from '@fluentui/react-components'
import {
  ArrowDownloadRegular,
  DeleteRegular,
  DocumentRegular,
  EditRegular,
  FolderRegular,
  MoreHorizontal20Regular,
  WarningRegular,
} from '@fluentui/react-icons'

import { useStyles } from '../styles'
import { formatBytes } from '../utils'

type FilesListProps = {
  entries: LocalCloud.FileSystemEntry[]
  loading: boolean
  busy: boolean
  onOpenDirectory: (name: string) => void
  onOpenFile: (name: string) => void
  onDownloadFile: (name: string) => void
  onRenameEntry: (entry: LocalCloud.FileSystemEntry) => void
  onDeleteEntry: (entry: LocalCloud.FileSystemEntry) => void
}

export const FilesList = ({
  entries,
  loading,
  busy,
  onOpenDirectory,
  onOpenFile,
  onDownloadFile,
  onRenameEntry,
  onDeleteEntry,
}: FilesListProps) => {
  const styles = useStyles()

  if (loading) {
    return (
      <section className={styles.center}>
        <Spinner label="Cargando archivos" />
      </section>
    )
  }

  if (entries.length === 0) {
    return (
      <section className={styles.emptyState}>
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <WarningRegular fontSize={32} />
            <Subtitle2>Esta carpeta esta vacia</Subtitle2>
          </div>
          <br />
          <Caption1>Sube un archivo o crea una carpeta para empezar.</Caption1>
        </div>
      </section>
    )
  }

  const openEntry = (entry: LocalCloud.FileSystemEntry) => {
    if (entry.type === 'directory') {
      onOpenDirectory(entry.name)
      return
    }

    onOpenFile(entry.name)
  }

  return (
    <section className={styles.list} aria-label="Archivos">
      {entries.map(entry => (
        <article
          className={mergeClasses(styles.row, styles.interactiveRow)}
          key={`${entry.type}:${entry.name}`}
          role="button"
          tabIndex={0}
          onClick={() => openEntry(entry)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openEntry(entry)
            }
          }}
        >
          <div className={styles.rowIcon}>
            {entry.type === 'directory' ? <FolderRegular /> : <DocumentRegular />}
          </div>
          <div className={styles.rowInfo}>
            <Subtitle2 className={styles.truncate}>{entry.name}</Subtitle2>
            <div className={styles.rowMeta}>
              {entry.type === 'directory' ? (
                <Caption1>{entry.children ?? 0} elementos</Caption1>
              ) : (
                <>
                  <Caption1>{formatBytes(entry.size)}</Caption1>
                  {entry.extension && <Badge appearance="tint">{entry.extension}</Badge>}
                </>
              )}
            </div>
          </div>
          <div className={styles.rowActions}>
            <div onClick={event => event.stopPropagation()}>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="secondary"
                    icon={<MoreHorizontal20Regular />}
                    disabled={busy}
                    aria-label={`Opciones de ${entry.name}`}
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {entry.type === 'file' && (
                      <MenuItem icon={<ArrowDownloadRegular />} onClick={() => onDownloadFile(entry.name)}>
                        Descargar
                      </MenuItem>
                    )}
                    <MenuItem icon={<EditRegular />} onClick={() => onRenameEntry(entry)}>
                      Renombrar
                    </MenuItem>
                    <MenuItem
                      className={styles.deleteAction}
                      icon={<DeleteRegular />}
                      onClick={() => onDeleteEntry(entry)}
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
