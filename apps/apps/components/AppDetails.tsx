import {
  Badge,
  Body1,
  Button,
  Caption1,
  Checkbox,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  ProgressBar,
  Spinner,
  Text,
} from '@fluentui/react-components'
import { ArrowUploadRegular, BoxSearchRegular, ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons'

import { useStyles } from '../styles'
import type { AppInfo, PermissionInfo, SourceGroup, SourceInfo, UpdateTask } from '../types'
import { getExtensions, getSourceKey } from '../utils'

type AppDetailsProps = {
  app: AppInfo | null
  currentPackageName: string
  permissions: PermissionInfo[]
  permissionsExpanded: boolean
  permissionsLoading: boolean
  permissionsError: string
  savingPermissions: Set<string>
  sourcesExpanded: boolean
  sourcesLoading: boolean
  sourcesError: string
  sourceGroups: SourceGroup[]
  sourcesCount: number
  savingSources: Set<string>
  canUpdate: boolean
  updateTask: UpdateTask | null
  onPermissionsExpandedChange: (expanded: boolean | ((current: boolean) => boolean)) => void
  onSourcesExpandedChange: (expanded: boolean | ((current: boolean) => boolean)) => void
  onPermissionChange: (permission: PermissionInfo, checked: boolean) => void
  onSourceChange: (sourceType: LocalCloud.SourceType, source: SourceInfo, checked: boolean) => void
  onChooseUpdate: () => void
  onCancelUpdate: () => void
}

export const AppDetails = ({
  app,
  currentPackageName,
  permissions,
  permissionsExpanded,
  permissionsLoading,
  permissionsError,
  savingPermissions,
  sourcesExpanded,
  sourcesLoading,
  sourcesError,
  sourceGroups,
  sourcesCount,
  savingSources,
  canUpdate,
  updateTask,
  onPermissionsExpandedChange,
  onSourcesExpandedChange,
  onPermissionChange,
  onSourceChange,
  onChooseUpdate,
  onCancelUpdate,
}: AppDetailsProps) => {
  const styles = useStyles()

  if (!app) {
    return (
      <div className={styles.emptyState}>
        <div>
          <BoxSearchRegular fontSize={30} />
          <br />
          <Body1>Selecciona una aplicacion para ver sus detalles.</Body1>
        </div>
      </div>
    )
  }

  const readOnly = app.packageName === currentPackageName
  const updateInProgress = updateTask?.status === 'uploading'

  return (
    <div className={styles.detailRows}>
      {readOnly && (
        <div className={styles.detailRow}>
          <Caption1>Estado</Caption1>
          <div className={styles.badges}>
            <Badge color="important" appearance="tint">Solo lectura</Badge>
          </div>
        </div>
      )}
      <div className={styles.detailRow}>
        <Caption1>Paquete</Caption1>
        <Text className={styles.monospace}>{app.packageName}</Text>
      </div>
      <div className={styles.detailRow}>
        <Caption1>Autor</Caption1>
        <Text>{app.author || 'Sin autor registrado'}</Text>
      </div>
      <div className={styles.detailRow}>
        <Caption1>Descripcion</Caption1>
        <Text>{app.description || 'Sin descripcion registrada'}</Text>
      </div>
      <div className={styles.detailRow}>
        <Caption1>Extensiones</Caption1>
        <div className={styles.badges}>
          {getExtensions(app).length === 0 ? (
            <Badge appearance="outline">Sin extensiones</Badge>
          ) : getExtensions(app).map(extension => (
            <Badge key={extension} appearance="outline">{extension}</Badge>
          ))}
        </div>
      </div>
      <div className={styles.detailRow}>
        <Caption1>Actualizacion</Caption1>
        <div className={styles.updatePanel}>
          <Button
            appearance="primary"
            icon={<ArrowUploadRegular />}
            disabled={!canUpdate || updateInProgress}
            onClick={onChooseUpdate}
          >
            Instalar actualizacion
          </Button>
          {!canUpdate && (
            <Caption1>No tienes permiso para actualizar apps.</Caption1>
          )}
          {updateTask && (
            <div className={styles.updateProgress}>
              <div className={styles.updateProgressHeader}>
                <Caption1 className={styles.truncate}>{updateTask.fileName}</Caption1>
                {updateInProgress ? (
                  <Button appearance="secondary" size="small" onClick={onCancelUpdate}>
                    Cancelar
                  </Button>
                ) : (
                  <Badge
                    appearance="filled"
                    color={updateTask.status === 'complete'
                      ? 'success'
                      : updateTask.status === 'error'
                        ? 'danger'
                        : updateTask.status === 'canceled'
                          ? 'warning'
                          : 'brand'}
                  >
                    {updateTask.status === 'complete'
                      ? 'Completada'
                      : updateTask.status === 'error'
                        ? 'Error'
                        : updateTask.status === 'canceled'
                          ? 'Cancelada'
                          : 'Subiendo'}
                  </Badge>
                )}
              </div>
              <ProgressBar value={updateTask.lengthComputable ? updateTask.percent / 100 : undefined} />
              <Caption1>
                {updateTask.message
                  ? updateTask.message
                  : updateTask.lengthComputable
                    ? `${updateTask.percent}%`
                    : `${updateTask.loaded} bytes subidos`}
              </Caption1>
            </div>
          )}
        </div>
      </div>
      <div className={styles.detailRow}>
        <div className={styles.permissionsHeader}>
          <div className={styles.permissionsTitle}>
            <Button
              appearance="transparent"
              className={styles.iconButton}
              icon={permissionsExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
              aria-label={permissionsExpanded ? 'Ocultar permisos' : 'Mostrar permisos'}
              aria-expanded={permissionsExpanded}
              onClick={() => onPermissionsExpandedChange(current => !current)}
            />
            <Caption1>Permisos</Caption1>
          </div>
          {!permissionsLoading && (
            <Badge appearance="outline">{permissions.length}</Badge>
          )}
        </div>
        {permissionsExpanded && (
          <>
            {permissionsError && (
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {permissionsError}
                </MessageBarBody>
              </MessageBar>
            )}
            {permissionsLoading ? (
              <Spinner size="tiny" label="Cargando permisos" />
            ) : permissions.length === 0 ? (
              <Badge appearance="outline">Sin permisos</Badge>
            ) : (
              <div className={styles.permissionsList}>
                {permissions.map(permission => {
                  const permissionSaving = savingPermissions.has(permission.name)
                  const disabled = app.packageName === currentPackageName || permissionSaving

                  return (
                    <div key={permission.name} className={styles.permissionItem}>
                      <Checkbox
                        checked={permission.enable}
                        disabled={disabled}
                        onChange={(_, data) => onPermissionChange(permission, data.checked === true)}
                      />
                      <div className={styles.permissionInfo}>
                        <Text weight="semibold" className={styles.monospace}>
                          {permission.name}
                        </Text>
                        <Caption1 className={styles.permissionDescription}>
                          {permission.description || 'Sin descripcion registrada'}
                        </Caption1>
                        {permissionSaving && <Caption1>Actualizando...</Caption1>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.detailRow}>
        <div className={styles.permissionsHeader}>
          <div className={styles.permissionsTitle}>
            <Button
              appearance="transparent"
              className={styles.iconButton}
              icon={sourcesExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
              aria-label={sourcesExpanded ? 'Ocultar fuentes' : 'Mostrar fuentes'}
              aria-expanded={sourcesExpanded}
              onClick={() => onSourcesExpandedChange(current => !current)}
            />
            <Caption1>Fuentes</Caption1>
          </div>
          {!sourcesLoading && (
            <Badge appearance="outline">{sourcesCount}</Badge>
          )}
        </div>
        {sourcesExpanded && (
          <>
            {sourcesError && (
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {sourcesError}
                </MessageBarBody>
              </MessageBar>
            )}
            {sourcesLoading ? (
              <Spinner size="tiny" label="Cargando fuentes" />
            ) : sourcesCount === 0 ? (
              <Badge appearance="outline">Sin fuentes</Badge>
            ) : (
              <div className={styles.permissionsList}>
                {sourceGroups.map(group => (
                  <div key={group.type} className={styles.sourceGroup}>
                    <div className={styles.sourceGroupHeader}>
                      <Caption1>{group.type}</Caption1>
                      <Badge appearance="outline">{group.sources.length}</Badge>
                    </div>
                    {group.sources.map(source => {
                      const sourceSaving = savingSources.has(getSourceKey(group.type, source.id))
                      const disabled = app.packageName === currentPackageName || sourceSaving

                      return (
                        <div key={`${group.type}-${source.id}`} className={styles.permissionItem}>
                          <Checkbox
                            checked={source.enable}
                            disabled={disabled}
                            onChange={(_, data) => onSourceChange(group.type, source, data.checked === true)}
                          />
                          <div className={styles.permissionInfo}>
                            <Text weight="semibold" className={styles.monospace}>
                              {source.url}
                            </Text>
                            <Caption1 className={styles.permissionDescription}>
                              {source.description || 'Sin descripcion registrada'}
                            </Caption1>
                            {sourceSaving && <Caption1>Actualizando...</Caption1>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
