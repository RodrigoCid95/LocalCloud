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
  EditRegular,
  MailRegular,
  PersonRegular,
  PhoneRegular,
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

type UpdateUserDialogProps = {
  user: LocalCloud.User
  onClose: () => void
  onUpdated: () => void
}

const UpdateUserDialog = ({ user, onClose, onUpdated }: UpdateUserDialogProps) => {
  const styles = useStyles()
  const [updatingUser, setUpdatingUser] = useState<boolean>(false)
  const [updateError, setUpdateError] = useState<string>('')
  const [updateForm, setUpdateForm] = useState<LocalCloud.DataUser>({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  })

  const handleUpdateFormChange = (field: keyof LocalCloud.DataUser, value: string) => {
    setUpdateForm(current => ({
      ...current,
      [field]: value,
    }))
    setUpdateError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const updatedUser = {
      fullName: updateForm.fullName.trim(),
      email: updateForm.email.trim(),
      phone: updateForm.phone.trim(),
    }

    setUpdatingUser(true)
    setUpdateError('')

    window.sdk.users.update(user.uid, updatedUser)
      .then(() => {
        onClose()
        onUpdated()
      })
      .catch(reason => {
        console.error(reason)
        setUpdateError('No se pudo actualizar el usuario.')
      })
      .finally(() => setUpdatingUser(false))
  }

  return (
    <Dialog
      open
      onOpenChange={(_, data) => !updatingUser && !data.open && onClose()}
    >
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Actualizar usuario</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                {updateError && (
                  <MessageBar intent="error" layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {updateError}
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
                <Field label="Nombre completo">
                  <Input
                    value={updateForm.fullName}
                    contentBefore={<PersonRegular />}
                    disabled={updatingUser}
                    onChange={(_, data) => handleUpdateFormChange('fullName', data.value)}
                  />
                </Field>
                <Field label="Correo">
                  <Input
                    value={updateForm.email}
                    type="email"
                    contentBefore={<MailRegular />}
                    disabled={updatingUser}
                    onChange={(_, data) => handleUpdateFormChange('email', data.value)}
                  />
                </Field>
                <Field label="Telefono">
                  <Input
                    value={updateForm.phone}
                    type="tel"
                    contentBefore={<PhoneRegular />}
                    disabled={updatingUser}
                    onChange={(_, data) => handleUpdateFormChange('phone', data.value)}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                disabled={updatingUser}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                appearance="primary"
                disabled={updatingUser}
                icon={updatingUser ? undefined : <EditRegular />}
                type="submit"
              >
                {updatingUser ? <Spinner size="tiny" label="Actualizando" /> : 'Actualizar'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

export default UpdateUserDialog
