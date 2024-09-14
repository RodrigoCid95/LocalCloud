import { useCallback, useState, type FC } from "react"
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Field, Input, Spinner, ToolbarButton } from "@fluentui/react-components"
import { FolderAdd24Filled } from '@fluentui/react-icons'
import { explorerController } from "../../utils/Explorer"

const NewFolder: FC<NewFolderProps> = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleOnSave = useCallback(() => {
    if (name) {
      const p = explorerController.path
      const base = p.shift()
      const callback = base === 'shared' ? window.connectors.fs.sharedMkdir : window.connectors.fs.userMkdir
      setLoading(true)
      callback([...p, name]).then(() => {
        setName('')
        setLoading(false)
        setOpen(false)
        explorerController.path = explorerController.path
      })
    }
  }, [name, setOpen, setLoading])

  return (
    <>
      <ToolbarButton
        appearance='subtle'
        aria-label='Create folder'
        icon={<FolderAdd24Filled />}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={() => !loading && setOpen(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Nueva carpeta</DialogTitle>
            <DialogContent>
              <Field>
                <Input type="text" value={name} disabled={loading} onChange={e => setName(e.target.value)} />
              </Field>
            </DialogContent>
            <DialogActions>
              {!loading && <Button appearance="secondary" onClick={() => setOpen(false)}>Cancelar</Button>}
              {
                loading
                  ? <Spinner />
                  : <Button appearance="primary" onClick={handleOnSave}>Crear</Button>
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}

interface NewFolderProps {
}

export default NewFolder