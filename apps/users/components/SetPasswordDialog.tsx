import { type FormEvent, useState } from 'react'
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
  makeStyles,
} from '@fluentui/react-components'
import {
  PasswordRegular,
  PersonRegular,
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

type SetPasswordDialogProps = {
  user: LocalCloud.User
  onClose: () => void
}

const SetPasswordDialog = ({ user, onClose }: SetPasswordDialogProps) => {
  const styles = useStyles()
  const [password, setPassword] = useState<string>('')
  const [settingPassword, setSettingPassword] = useState<boolean>(false)
  const [setPasswordError, setSetPasswordError] = useState<string>('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password === '') {
      setSetPasswordError('La contrasena es requerida.')
      return
    }

    setSettingPassword(true)
    setSetPasswordError('')

    window.sdk.users.setPassword({
      uid: user.uid,
      password,
    })
      .then(onClose)
      .catch(reason => {
        console.error(reason)
        setSetPasswordError('No se pudo establecer la contrasena.')
      })
      .finally(() => setSettingPassword(false))
  }

  return (
    <Dialog
      open
      onOpenChange={(_, data) => !settingPassword && !data.open && onClose()}
    >
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Establecer contrasena</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                {setPasswordError && (
                  <MessageBar intent="error" layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {setPasswordError}
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
                <Field label="Nueva contrasena" required>
                  <Input
                    value={password}
                    type="password"
                    contentBefore={<PasswordRegular />}
                    disabled={settingPassword}
                    onChange={(_, data) => {
                      setPassword(data.value)
                      setSetPasswordError('')
                    }}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                disabled={settingPassword}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                appearance="primary"
                disabled={settingPassword}
                icon={settingPassword ? undefined : <PasswordRegular />}
                type="submit"
              >
                {settingPassword ? <Spinner size="tiny" label="Guardando" /> : 'Guardar'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

export default SetPasswordDialog
