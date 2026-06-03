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
  MailRegular,
  PersonAddRegular,
  PersonRegular,
  PhoneRegular,
} from '@fluentui/react-icons'

const emptyUserForm: LocalCloud.NewUser = {
  name: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
}

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

type CreateUserDialogProps = {
  onClose: () => void
  onCreated: () => void
}

const CreateUserDialog = ({ onClose, onCreated }: CreateUserDialogProps) => {
  const styles = useStyles()
  const [creatingUser, setCreatingUser] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string>('')
  const [userForm, setUserForm] = useState<LocalCloud.NewUser>(emptyUserForm)

  const handleUserFormChange = (field: keyof LocalCloud.NewUser, value: string) => {
    setUserForm(current => ({
      ...current,
      [field]: value,
    }))
    setCreateError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newUser = {
      name: userForm.name.trim(),
      fullName: userForm.fullName.trim(),
      email: userForm.email.trim(),
      phone: userForm.phone.trim(),
      password: userForm.password,
    }

    if (newUser.name === '' || newUser.password === '') {
      setCreateError('El usuario y la contrasena son requeridos.')
      return
    }

    setCreatingUser(true)
    setCreateError('')

    window.sdk.users.create(newUser)
      .then(() => {
        setUserForm(emptyUserForm)
        onClose()
        onCreated()
      })
      .catch(reason => {
        console.error(reason)
        setCreateError('No se pudo crear el usuario.')
      })
      .finally(() => setCreatingUser(false))
  }

  return (
    <Dialog
      open
      onOpenChange={(_, data) => !creatingUser && !data.open && onClose()}
    >
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Crear usuario</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                {createError && (
                  <MessageBar intent="error" layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {createError}
                    </MessageBarBody>
                  </MessageBar>
                )}
                <Field label="Usuario" required>
                  <Input
                    value={userForm.name}
                    contentBefore={<PersonRegular />}
                    disabled={creatingUser}
                    onChange={(_, data) => handleUserFormChange('name', data.value)}
                  />
                </Field>
                <Field label="Nombre completo">
                  <Input
                    value={userForm.fullName}
                    contentBefore={<PersonRegular />}
                    disabled={creatingUser}
                    onChange={(_, data) => handleUserFormChange('fullName', data.value)}
                  />
                </Field>
                <Field label="Correo">
                  <Input
                    value={userForm.email}
                    type="email"
                    contentBefore={<MailRegular />}
                    disabled={creatingUser}
                    onChange={(_, data) => handleUserFormChange('email', data.value)}
                  />
                </Field>
                <Field label="Telefono">
                  <Input
                    value={userForm.phone}
                    type="tel"
                    contentBefore={<PhoneRegular />}
                    disabled={creatingUser}
                    onChange={(_, data) => handleUserFormChange('phone', data.value)}
                  />
                </Field>
                <Field label="Contrasena" required>
                  <Input
                    value={userForm.password}
                    type="password"
                    disabled={creatingUser}
                    onChange={(_, data) => handleUserFormChange('password', data.value)}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                disabled={creatingUser}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                appearance="primary"
                disabled={creatingUser}
                icon={creatingUser ? undefined : <PersonAddRegular />}
                type="submit"
              >
                {creatingUser ? <Spinner size="tiny" label="Creando" /> : 'Crear'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

export default CreateUserDialog
