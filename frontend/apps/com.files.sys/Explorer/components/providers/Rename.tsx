import { type FC, type ReactNode, useState } from 'react'
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Field, Input, Spinner } from '@fluentui/react-components'
import { useExplorer } from '../../context/explorer'
import { RenameContext } from './../../context/rename'

const RenameProvider: FC<RenameProviderProps> = ({ children }) => {
  const { refresh } = useExplorer()
  const [path, setPath] = useState<string[] | null>(null)
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const addToRename = (p: string[]) => {
    setValue(p[p.length - 1])
    setPath(p)
  }

  const rename = async () => {
    if (path) {
      setLoading(true)
      await window.connectors.fs.rename(path, value)
      setLoading(false)
      setPath(null)
      refresh()
    }
  }

  return (
    <RenameContext.Provider value={{ addToRename }}>
      {children}
      <Dialog
        modalType='alert'
        open={path !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPath(null)
          }
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Renombrar</DialogTitle>
            <DialogContent>
              <Field>
                <Input value={value} onChange={e => setValue(e.target.value)} />
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
                      {value !== '' && (
                        <DialogTrigger disableButtonEnhancement>
                          <Button onClick={rename}>Renombrar</Button>
                        </DialogTrigger>
                      )}
                    </>
                  )
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </RenameContext.Provider>
  )
}

export default RenameProvider

interface RenameProviderProps {
  children: ReactNode
}