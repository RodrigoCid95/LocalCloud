import { useCallback, useEffect, useRef, useState, type FC } from "react"
import { Caption1, Card, CardHeader, makeStyles, tokens, Text, Button, Popover, PopoverSurface, useRestoreFocusTarget, Title3, Toast, ToastTitle, useToastController, useId, Toaster, ToastTrigger, Link, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Field, Input, Spinner } from "@fluentui/react-components"
import { DocumentFilled, FolderFilled } from '@fluentui/react-icons'
import { explorerController } from "../../utils/Explorer"
import { clipboardController } from "../../utils/Clipboard"
import { transfers } from "../../utils/Transfers"

const useStyles = makeStyles({
  caption: {
    color: tokens.colorNeutralForeground3,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '12px',
  }
})

const Item: FC<ItemProps> = ({ item, onLaunch }) => {
  const thisPath: string[] = [...explorerController.path, item.name]
  const styles = useStyles()
  const [open, setOpen] = useState<boolean>(false)
  const [rename, setRename] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [name, setName] = useState<string>(item.name)
  const [selected, setSelected] = useState<boolean>(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const restoreFocusTargetAttribute = useRestoreFocusTarget()
  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  useEffect(() => {
    const handlerOnSeletableChange = () => setSelected(false)
    explorerController.on('selectableChange', handlerOnSeletableChange)
    return () => explorerController.off('selectableChange', handlerOnSeletableChange)
  }, [setSelected])

  const handleOnClick = useCallback(() => {
    if (!explorerController.selectable) {
      if (item.isFile) {
        if (onLaunch) {
          onLaunch(item.name)
        }
      } else {
        explorerController.path = thisPath
      }
    }
  }, [cardRef, item, onLaunch])

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + unidades[i]
  }, [])

  const handleOnOpen = useCallback(() => {
    setOpen(false)
    handleOnClick()
  }, [setOpen, handleOnClick])

  const handleCopy = useCallback(() => {
    setOpen(false)
    clipboardController.copy([thisPath.join('/')])
  }, [item])

  const handleCut = useCallback(() => {
    setOpen(false)
    clipboardController.cut([thisPath.join('/')])
  }, [item])

  const handlePaste = useCallback(() => {
    if (!item.isFile) {
      setOpen(false)
      clipboardController.paste(thisPath)
    }
  }, [item])

  const handleDelete = useCallback(() => {
    window.connectors.recycleBin.add(thisPath).then(() => {
      explorerController.path = explorerController.path
    })
  }, [item])

  const handleShare = useCallback(() => {
    window.connectors.shared.create(thisPath).then(({ id }) => {
      const url = window.createURL({ path: ['shared', id] }).href
      if (document.hasFocus()) {
        navigator.clipboard.writeText(url)
      }
      dispatchToast(
        <Toast>
          <ToastTitle
            action={
              <ToastTrigger>
                <Link>Aceptar</Link>
              </ToastTrigger>
            }
          >Archivo compartido y en el portapapeles.</ToastTitle>
        </Toast>,
        { intent: "success" }
      )
      setOpen(false)
    })
  }, [item])

  const handleOnSave = useCallback(() => {
    if (name) {
      setLoading(true)
      window.connectors.fs.rename(thisPath, name).then(() => {
        setLoading(false)
        setRename(false)
        explorerController.path = explorerController.path
      })
    }
  }, [name, setLoading, item, setRename])

  const handleDownload = useCallback(() => {
    const fileTransfer = window.createDownloader(thisPath)
    fileTransfer.start()
    transfers.downloads.add({ fileTransfer, name: item.name })
    setOpen(false)
  }, [item, setOpen])

  return (
    <div style={{ display: 'contents' }}>
      <Dialog open={rename} onOpenChange={() => !loading && setRename(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Renombrar {item.isFile ? 'archivo' : 'carpeta'}</DialogTitle>
            <DialogContent>
              <Field>
                <Input type="text" value={name} disabled={loading} onChange={e => setName(e.target.value)} />
              </Field>
            </DialogContent>
            <DialogActions>
              {!loading && <Button appearance="secondary" onClick={() => setRename(false)}>Cancelar</Button>}
              {
                loading
                  ? <Spinner />
                  : <Button appearance="primary" onClick={handleOnSave}>Renombrar</Button>
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Toaster
        toasterId={toasterId}
        position="bottom-end"
        pauseOnHover
        pauseOnWindowBlur
      />
      <Card
        {...restoreFocusTargetAttribute}
        ref={cardRef}
        className='item'
        size="small"
        role="listitem"
        onClick={handleOnClick}
        onContextMenu={(e) => {
          e.preventDefault()
          if (!explorerController.selectable) {
            setOpen(o => !o)
          }
        }}
        selected={explorerController.selectable && selected}
        onSelectionChange={() => {
          if (explorerController.selectable) {
            const newSelected = !selected
            if (newSelected) {
              explorerController.addSelection(thisPath)
            } else {
              explorerController.removeSelection(thisPath)
            }
            setSelected(newSelected)
          }
        }}
      >
        <CardHeader
          image={item.isFile ? <DocumentFilled /> : <FolderFilled />}
          header={<Text weight="semibold">{item.name}</Text>}
          description={(
            <Caption1 className={styles.caption}>
              {item.isFile ? formatSize(item.size) : ''}
            </Caption1>
          )}
        />
      </Card>
      <Popover
        onOpenChange={(_, data) => setOpen(data.open)}
        trapFocus
        open={open}
        positioning={{
          positioningRef(pir) {
            if (cardRef.current) {
              pir?.setTarget(cardRef.current)
            }
          }
        }}
      >
        <PopoverSurface>
          <div>
            <Title3>{item.name}</Title3>
          </div>
          <div className={styles.list}>
            <Button onClick={handleOnOpen}>Abrir</Button>
            <Button onClick={handleCopy}>Copiar</Button>
            <Button onClick={handleCut}>Cortar</Button>
            {!item.isFile && clipboardController.pendingPaste && <Button onClick={handlePaste}>Pegar</Button>}
            <Button onClick={() => {
              setOpen(false)
              setRename(true)
            }}>Renombrar</Button>
            {item.isFile && (
              <>
                <Button onClick={handleDownload}>Descargar</Button>
                <Button onClick={handleShare}>Compartir</Button>
              </>
            )}
            <Button onClick={handleDelete}>Mover a la papelera</Button>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  )
}

export default Item

interface ItemProps {
  item: FS.ItemInfo
  onLaunch?: (name: string) => void
}