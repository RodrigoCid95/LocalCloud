import { useCallback, useEffect, useState, type FC } from "react"
import { Button, Card, CardHeader, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Spinner, Title3, ToolbarButton, Text, Toast, useToastController, useId, Link, ToastTitle, ToastTrigger, Toaster } from "@fluentui/react-components"
import { ShareFilled, ShareMultipleFilled, CopyFilled, DeleteFilled } from '@fluentui/react-icons'

const Item: FC<ItemProps> = ({ item, onRemove }) => {
  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  const p = [...item.path]
  const base = p.shift()

  const handleRestore = useCallback(() => {
    const url = window.createURL({
      path: ['shared', item.id]
    }).href
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
        >Enlace copiado!</ToastTitle>
      </Toast>,
      { intent: "success" }
    )
  }, [item])

  const handleDelete = useCallback(() => {
    window.connectors.shared.delete(item.id)
    onRemove()
  }, [item, onRemove])

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">{base === 'user' ? 'Carpeta personal' : 'Carpeta compartida'} &gt; {p.join(' > ')}</Text>}
        action={
          <div style={{ display: 'flex' }}>
            <Button
              appearance="transparent"
              icon={<CopyFilled />}
              aria-label="Restore"
              onClick={handleRestore}
            />
            <Button
              appearance="transparent"
              icon={<DeleteFilled />}
              aria-label="Delete"
              onClick={handleDelete}
            />
          </div>
        }
      />
      <Toaster
        toasterId={toasterId}
        position="bottom-end"
        pauseOnHover
        pauseOnWindowBlur
      />
    </Card>
  )
}

interface ItemProps {
  item: Shared.Shared
  onRemove(): void
}

const SharedMenu = () => {
  const [items, setItems] = useState<Shared.Shared[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    window.connectors.shared.list().then(items => setItems(items))
  }, [setItems])

  const handleOnClean = useCallback(async () => {
    setLoading(true)
    for (const item of items) {
      await window.connectors.shared.delete(item.id)
    }
    setLoading(false)
    setItems([])
    setOpen(false)
  }, [items, setLoading])

  const handleOnRemove = useCallback(() => {
    window.connectors.shared.list().then(items => setItems(items))
  }, [setItems])

  return (
    <>
      <Dialog open={open} onOpenChange={() => !loading && setOpen(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Papelera de reciclaje</DialogTitle>
            <DialogContent>
              {items.map((item, index) => <Item key={index} item={item} onRemove={handleOnRemove} />)}
              {items.length === 0 && <Title3>No hay elementos.</Title3>}
            </DialogContent>
            <DialogActions style={{ marginTop: '16px', marginBottom: '16px' }}>
              {!loading && <Button appearance="secondary" onClick={() => setOpen(false)}>Cerrar</Button>}
              {
                loading
                  ? <Spinner />
                  : items.length > 0 ? <Button appearance="primary" onClick={handleOnClean}>Vaciar</Button> : null
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <ToolbarButton
        icon={items.length > 0 ? <ShareMultipleFilled /> : <ShareFilled />}
        vertical
        onClick={() => setOpen(true)}
      >
        Compartidos
      </ToolbarButton>
    </>
  )
}

export default SharedMenu
