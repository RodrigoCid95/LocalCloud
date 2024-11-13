import { useState } from "react"
import { type DialogOpenChangeData, Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Field, Input, Spinner, ToolbarButton } from "@fluentui/react-components"
import { bundleIcon, FolderAddFilled, FolderAddRegular } from '@fluentui/react-icons'
import { useExplorer } from './../context/explorer'

const FolderAddIcon = bundleIcon(FolderAddFilled, FolderAddRegular)

export default () => {
  const { baseDir, path, refresh } = useExplorer()
  const [open, setOpen] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleOnOpenChange = (_: any, data: DialogOpenChangeData) => {
    setOpen(data.open)
    if (data.open) {
      setName('')
    }
  }

  const handleOnSave = () => {
    if (name) {
      setLoading(true)
      const callback = baseDir === 'shared' ? window.connectors.fs.sharedMkdir : window.connectors.fs.userMkdir
      callback([...path, name]).then(() => {
        setName('')
        setLoading(false)
        setOpen(false)
        refresh()
      })
    } else {
      setError('Campo requerido.')
    }
  }

  return (
    <Dialog
      modalType='alert'
      open={open}
      onOpenChange={handleOnOpenChange}
    >
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton
          appearance="subtle"
          aria-label="Add folder"
          icon={<FolderAddIcon />}
        />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Crear carpeta</DialogTitle>
          <DialogContent>
            <Field
              validationState={error !== '' ? 'error' : 'none'}
              validationMessage={error}
            >
              <Input placeholder="Nombre de la carpeta" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setError('')} />
            </Field>
          </DialogContent>
          <DialogActions>
            {
              loading
                ? <Spinner />
                : (
                  <>
                    <DialogTrigger disableButtonEnhancement>
                      <Button appearance="secondary">Cancelar</Button>
                    </DialogTrigger>
                    <Button appearance="primary" onClick={handleOnSave}>Crear</Button>
                  </>
                )
            }
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}