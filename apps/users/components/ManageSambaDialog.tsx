import { type FormEvent, useEffect, useState } from 'react'
import {
  Button,
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
  MessageBarTitle,
  Spinner,
  Switch,
  makeStyles,
} from '@fluentui/react-components'
import {
  PasswordRegular,
  PersonRegular,
  SaveRegular,
  ServerRegular,
} from '@fluentui/react-icons'

const useStyles = makeStyles({
  dialogForm: {
    display: 'grid',
    gap: '14px',
    minWidth: '320px',

    '@media (max-width: 480px)': {
      minWidth: '0',
    },
  },
})

type ManageSambaDialogProps = {
  user: LocalCloud.User
  initialEnabled?: boolean
  onClose: () => void
  onUpdated: (enabled: boolean) => void
}

const ManageSambaDialog = ({ user, initialEnabled, onClose, onUpdated }: ManageSambaDialogProps) => {
  const styles = useStyles()
  const [enabled, setEnabled] = useState<boolean>(initialEnabled ?? false)
  const [savedEnabled, setSavedEnabled] = useState<boolean>(initialEnabled ?? false)
  const [password, setPassword] = useState<string>('')
  const [loadingSamba, setLoadingSamba] = useState<boolean>(initialEnabled === undefined)
  const [savingSamba, setSavingSamba] = useState<boolean>(false)
  const [sambaError, setSambaError] = useState<string>('')

  useEffect(() => {
    let mounted = true

    if (initialEnabled !== undefined) {
      return () => {
        mounted = false
      }
    }

    window.sdk.samba.belongsTo(user.uid)
      .then(currentEnabled => {
        if (!mounted) {
          return
        }

        setEnabled(currentEnabled === true)
        setSavedEnabled(currentEnabled === true)
      })
      .catch(reason => {
        console.error(reason)
        if (mounted) {
          setSambaError('No se pudo consultar el estado de Samba.')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSamba(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [initialEnabled, user.uid])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newPassword = password.trim()
    if (!savedEnabled && enabled && newPassword === '') {
      setSambaError('La contrasena de Samba es requerida para activar el usuario.')
      return
    }

    setSavingSamba(true)
    setSambaError('')

    const updateSamba = enabled
      ? window.sdk.samba.enable(user.uid)
      : window.sdk.samba.disable(user.uid)

    updateSamba
      .then(() => {
        if (!enabled || newPassword === '') {
          return
        }

        return window.sdk.samba.setPassword(user.uid, newPassword)
      })
      .then(() => {
        onUpdated(enabled)
        onClose()
      })
      .catch(reason => {
        console.error(reason)
        setSambaError('No se pudo actualizar la configuracion de Samba.')
      })
      .finally(() => setSavingSamba(false))
  }

  return (
    <Dialog
      open
      onOpenChange={(_, data) => !savingSamba && !data.open && onClose()}
    >
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Administrar Samba</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                {sambaError && (
                  <MessageBar intent="error" layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {sambaError}
                    </MessageBarBody>
                  </MessageBar>
                )}
                <Field label="Usuario">
                  <Input
                    value={user.name}
                    contentBefore={<PersonRegular />}
                    disabled
                  />
                </Field>
                <Switch
                  checked={enabled}
                  disabled={loadingSamba || savingSamba}
                  label={enabled ? 'Samba activado' : 'Samba desactivado'}
                  onChange={(_, data) => {
                    setEnabled(data.checked)
                    setSambaError('')
                  }}
                />
                <Field label="Contrasena Samba" required={!savedEnabled && enabled}>
                  <Input
                    value={password}
                    type="password"
                    contentBefore={<PasswordRegular />}
                    disabled={!enabled || loadingSamba || savingSamba}
                    onChange={(_, data) => {
                      setPassword(data.value)
                      setSambaError('')
                    }}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                disabled={savingSamba}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                appearance="primary"
                disabled={loadingSamba || savingSamba}
                icon={savingSamba ? undefined : enabled ? <SaveRegular /> : <ServerRegular />}
                type="submit"
              >
                {savingSamba ? <Spinner size="tiny" label="Guardando" /> : 'Guardar'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

export default ManageSambaDialog
