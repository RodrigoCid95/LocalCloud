import { useState } from 'react'
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
  MessageBarTitle,
  Spinner,
  makeStyles,
} from '@fluentui/react-components'
import { DeleteRegular } from '@fluentui/react-icons'

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

type DeleteUserDialogProps = {
  user: LocalCloud.User
  onClose: () => void
  onDeleted: () => void
}

const DeleteUserDialog = ({ user, onClose, onDeleted }: DeleteUserDialogProps) => {
  const styles = useStyles()
  const [deletingUser, setDeletingUser] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string>('')

  const handleDeleteUser = () => {
    setDeletingUser(true)
    setDeleteError('')

    window.sdk.users.delete(user.uid)
      .then(() => {
        onClose()
        onDeleted()
      })
      .catch(reason => {
        console.error(reason)
        setDeleteError('No se pudo eliminar el usuario.')
      })
      .finally(() => setDeletingUser(false))
  }

  return (
    <Dialog
      open
      onOpenChange={(_, data) => !deletingUser && !data.open && onClose()}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Eliminar usuario</DialogTitle>
          <DialogContent>
            <div className={styles.dialogForm}>
              {deleteError && (
                <MessageBar intent="error" layout="multiline">
                  <MessageBarBody>
                    <MessageBarTitle>Error</MessageBarTitle>
                    {deleteError}
                  </MessageBarBody>
                </MessageBar>
              )}
              <Body1>
                Estas seguro de que quieres eliminar el usuario{' '}
                <strong>{user.fullName || user.name}</strong>?
              </Body1>
              <Caption1>Esta accion no se puede deshacer.</Caption1>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              disabled={deletingUser}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              appearance="primary"
              disabled={deletingUser}
              icon={deletingUser ? undefined : <DeleteRegular />}
              onClick={handleDeleteUser}
            >
              {deletingUser ? <Spinner size="tiny" label="Eliminando" /> : 'Eliminar'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default DeleteUserDialog
