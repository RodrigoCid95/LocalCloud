import { type FC, useEffect, useState, useCallback } from "react"
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Button, Spinner, Switch, Caption1 } from "@fluentui/react-components"

const PERMISSION_LIST: PermissionList = {
  'APP_LIST': 'Lista de aplicaciones instaladas.',
  'APP_LIST_BY_UUID': 'Lista de aplicaciones instaladas filtradas por usuario.',
  'INSTALL_APP': 'Instalar aplicaciones.',
  'UNINSTALL_APP': 'Desinstalar aplicaciones.',
  'ACCESS_SHARED_FILE_LIST': 'Acceso a lista de archivos en carpeta compartida.',
  'ACCESS_USER_FILE_LIST': 'Acceso a lista de archivos en carpeta del usuario.',
  'CREATE_SHARED_DIR': 'Crear directorios en carpeta compartida.',
  'CREATE_USER_DIR': 'Crear directorios en carpeta del usuario.',
  'UPLOAD_SHARED_FILE': 'Subir archivos en carpeta compartida.',
  'UPLOAD_USER_FILE': 'Subir archivos en carpeta del usuario.',
  'REMOVE_SHARED_FILES_AND_DIRECTORIES': 'Eliminar archivos y/o directorios en carpeta compartida.',
  'REMOVE_USER_FILES_AND_DIRECTORIES': 'Eliminar archivos y/o directorios en carpeta del usuario.',
  'ENABLE_PERMISSION': 'Habilitar permisos de aplicaciones.',
  'DISABLE_PERMISSION': 'Deshabilitar permisos de aplicaciones.',
  'PROFILE_INFO': 'Acceso a la información del perfil.',
  'PROFILE_APP_LIST': 'Lista de aplicaciones del asignadas al usuario.',
  'UPDATE_PROFILE_INFO': 'Actualizar información del perfil.',
  'UPDATE_PASSWORD': 'Actualizar la contraseña.',
  'ENABLE_SOURCE': 'Habilita una fuente de recursos.',
  'DISABLE_SOURCE': 'Deshabilita una fuente de recursos.',
  'USER_LIST': 'Lista de usuarios.',
  'USER_INFO': 'Información de un usuario.',
  'CREATE_USER': 'Crear usuarios',
  'UPDATE_USER_INFO': 'Actualizar la información de un usuario.',
  'DELETE_USER': 'Eliminar usuarios',
  'ASSIGN_APP_TO_USER': 'Asignar una aplicación a un usuario.',
  'UNASSIGN_APP_TO_USER': 'Quitar la asignación de una aplicación a un usuario.',
}

const AppPermission: FC<AppPermissionProps> = ({ permission }) => {
  const [checked, setChecked] = useState<boolean>(permission.active)
  const [disable, setDisable] = useState<boolean>(false)

  const handleChange = useCallback(() => {
    setDisable(true)
    const callback = checked ? window.connectors.permissions.disable : window.connectors.permissions.enable
    callback(permission.id)
      .then(() => {
        setChecked(!checked)
        setDisable(false)
      })
      .catch(() => setDisable(false))
  }, [setDisable, checked, setChecked, permission])

  return (
    <Switch
      label={PERMISSION_LIST[permission.api] || permission.api}
      disabled={disable}
      checked={checked}
      onChange={handleChange}
    />
  )
}

interface AppPermissionProps {
  permission: Permissions.Permission
}

const AppPermissions: FC<AppPermissionsProps> = ({ app, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [permissions, setPermissions] = useState<Permissions.Permission[]>([])

  useEffect(() => {
    const { package_name } = app
    window.connectors.permissions.find({ package_name }).then(result => {
      setPermissions(result)
      setLoading(false)
    })
  }, [app, setPermissions, setLoading])

  return (
    <Dialog
      open={app !== undefined}
      onOpenChange={(_, data) => {
        if (!data.open) {
          onClose()
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Permisos de {app.title}</DialogTitle>
          <DialogContent>
            {loading && <Spinner />}
            {permissions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", }}>
                {permissions.map((permission, index) => (
                  <AppPermission
                    key={index}
                    permission={permission}
                  />
                ))}
              </div>
            )}
            {permissions.length === 0 && <Caption1>Esta app no cuenta con fuentes seguras.</Caption1>}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary">Cerrar</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

interface PermissionList {
  [api: string]: string
}
interface AppPermissionsProps {
  app: Apps.App
  onClose(): void
}

export default AppPermissions