import { type FC, useCallback, useState } from "react"
import { Dialog, DialogTrigger, Button, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Tooltip, Spinner } from "@fluentui/react-components"

const Delete: FC<DeleteProps> = ({ user, onClose, onDelete }) => {
  const [loading, setLoading] = useState<boolean>(false)

  const handleDelete = useCallback(() => {
    if (user) {
      setLoading(true)
      window.connectors.users.delete(user.uid)
        .then(onDelete)
    }
  }, [setLoading, user, onDelete])

  return (
    <Dialog
      open={user !== undefined}
      onOpenChange={(_, data) => {
        if (!data.open && !loading) {
          onClose()
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Eliminar usuario</DialogTitle>
          <DialogContent>
            ¿Quieres eliminar el usuario {user?.name}?
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">No</Button>
            </DialogTrigger>
            {
              loading
                ? <Spinner />
                : (
                  <Tooltip content='Esto hará que se elimine su acceso al servidor, sus archivos y las asignaciones de aplicaciones que tenga.' relationship="inaccessible">
                    <Button appearance="primary" onClick={handleDelete}>Si</Button>
                  </Tooltip>
                )
            }
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

interface DeleteProps {
  user: Users.User | undefined
  onClose(): void
  onDelete(): void
}

export default Delete