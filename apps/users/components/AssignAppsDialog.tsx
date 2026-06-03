import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Body1,
  Button,
  Caption1,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { AppsListDetailRegular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  dialogContent: {
    display: 'grid',
    gap: '14px',
    minWidth: '420px',

    '@media (max-width: 560px)': {
      minWidth: '0',
    },
  },
  appList: {
    maxHeight: '420px',
    overflowY: 'auto',
    display: 'grid',
    gap: '8px',
    paddingRight: '2px',
  },
  appItem: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'flex-start',
    gap: '10px',
    paddingTop: '10px',
    paddingRight: '12px',
    paddingBottom: '10px',
    paddingLeft: '12px',
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  appInfo: {
    minWidth: 0,
    display: 'grid',
    gap: '2px',
  },
  appTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  appDescription: {
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  emptyState: {
    minHeight: '160px',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: '8px',
  },
})

type AssignAppsDialogProps = {
  user: LocalCloud.User
  onClose: () => void
}

const AssignAppsDialog = ({ user, onClose }: AssignAppsDialogProps) => {
  const styles = useStyles()
  const [apps, setApps] = useState<LocalCloud.App[]>([])
  const [assignedPackages, setAssignedPackages] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<boolean>(true)
  const [savingPackages, setSavingPackages] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>('')

  const loadAssignments = useCallback(() => {
    setLoading(true)
    setError('')

    Promise.all([
      window.sdk.apps.getAll(),
      window.sdk.assignments.get(user.uid),
    ])
      .then(([allApps, assignedApps]) => {
        const assigned = assignedApps ?? []
        setApps(allApps)
        setAssignedPackages(new Set(assigned.map(app => app.packageName)))
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudieron cargar las aplicaciones.')
        setApps([])
        setAssignedPackages(new Set())
      })
      .finally(() => setLoading(false))
  }, [user.uid])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  const assignedCount = useMemo(() => assignedPackages.size, [assignedPackages])
  const isSaving = savingPackages.size > 0

  const setPackageSaving = (packageName: string, saving: boolean) => {
    setSavingPackages(current => {
      const next = new Set(current)
      if (saving) {
        next.add(packageName)
      } else {
        next.delete(packageName)
      }
      return next
    })
  }

  const handleAssignmentChange = (app: LocalCloud.App, checked: boolean) => {
    const wasAssigned = assignedPackages.has(app.packageName)
    if (wasAssigned === checked) {
      return
    }

    setError('')
    setPackageSaving(app.packageName, true)
    setAssignedPackages(current => {
      const next = new Set(current)
      if (checked) {
        next.add(app.packageName)
      } else {
        next.delete(app.packageName)
      }
      return next
    })

    const request = checked
      ? window.sdk.assignments.add(user.uid, app.packageName)
      : window.sdk.assignments.remove(user.uid, app.packageName)

    request
      .catch(reason => {
        console.error(reason)
        setError('No se pudo actualizar la asignacion.')
        setAssignedPackages(current => {
          const next = new Set(current)
          if (wasAssigned) {
            next.add(app.packageName)
          } else {
            next.delete(app.packageName)
          }
          return next
        })
      })
      .finally(() => setPackageSaving(app.packageName, false))
  }

  return (
    <Dialog
      open
      onOpenChange={(_, data) => !isSaving && !data.open && onClose()}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Asignar aplicaciones</DialogTitle>
          <DialogContent>
            <div className={styles.dialogContent}>
              <Body1>
                Usuario <strong>{user.fullName || user.name}</strong>
              </Body1>
              {error && (
                <MessageBar intent="error" layout="multiline">
                  <MessageBarBody>
                    <MessageBarTitle>Error</MessageBarTitle>
                    {error}
                  </MessageBarBody>
                </MessageBar>
              )}
              {loading ? (
                <Spinner label="Cargando aplicaciones" />
              ) : apps.length === 0 ? (
                <div className={styles.emptyState}>
                  <div>
                    <AppsListDetailRegular fontSize={28} />
                    <Body1>No hay aplicaciones disponibles.</Body1>
                  </div>
                </div>
              ) : (
                <div className={styles.appList}>
                  {apps.map(app => {
                    const packageSaving = savingPackages.has(app.packageName)
                    return (
                      <div key={app.packageName} className={styles.appItem}>
                        <Checkbox
                          checked={assignedPackages.has(app.packageName)}
                          disabled={packageSaving}
                          onChange={(_, data) => handleAssignmentChange(app, data.checked === true)}
                        />
                        <div className={styles.appInfo}>
                          <Text weight="semibold" className={styles.appTitle}>
                            {app.title || app.packageName}
                          </Text>
                          <Caption1>{app.packageName}</Caption1>
                          {app.description && (
                            <Caption1 className={styles.appDescription}>
                              {app.description}
                            </Caption1>
                          )}
                          {packageSaving && <Caption1>Actualizando...</Caption1>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {!loading && apps.length > 0 && (
                <Caption1>{assignedCount} de {apps.length} aplicaciones asignadas</Caption1>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              disabled={isSaving}
              onClick={onClose}
            >
              Listo
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default AssignAppsDialog
