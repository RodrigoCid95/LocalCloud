import { type FC, useState, useEffect, useCallback } from "react"
import { Button, Caption1, Card, CardHeader, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Spinner, ToolbarButton, Text } from "@fluentui/react-components"
import { BinRecycleFullFilled, BinRecycleFilled, DeleteArrowBackFilled, DeleteFilled } from '@fluentui/react-icons'

const Item: FC<ItemProps> = ({ item, onRemove }) => {
  const p = [...item.path]
  const base = p.shift()

  const handleRestore = useCallback(() => {
    window.connectors.recycleBin.restore(item.id)
    onRemove()
  }, [item, onRemove])

  const handleDelete = useCallback(() => {
    window.connectors.recycleBin.delete(item.id)
    onRemove()
  }, [item, onRemove])

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">{base === 'user' ? 'Carpeta personal' : 'Carpeta compartida'} &gt; {p.join(' > ')}</Text>}
        description={<Caption1>{item.date}</Caption1>}
        action={
          <div style={{ display: 'flex' }}>
            <Button
              appearance="transparent"
              icon={<DeleteArrowBackFilled />}
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
    </Card>
  )
}

interface ItemProps {
  item: RecycleBin.Item
  onRemove(): void
}

const BinRecycleMenu: FC = () => {
  const [items, setItems] = useState<RecycleBin.Item[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    window.connectors.recycleBin.list().then(items => setItems(items))
  }, [setItems])

  const handleOnClean = useCallback(() => {
    setLoading(true)
    window.connectors.recycleBin.clean().then(() => {
      setLoading(false)
      setItems([])
      setOpen(false)
    })
  }, [setLoading])

  const handleOnRemove = useCallback(() => {
    window.connectors.recycleBin.list().then(items => setItems(items))
  }, [setItems])

  return (
    <>
      <Dialog open={open} onOpenChange={() => !loading && setOpen(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Papelera de reciclaje</DialogTitle>
            <DialogContent>
              {items.map((item, index) => <Item key={index} item={item} onRemove={handleOnRemove} />)}
              {items.length === 0 && <Caption1>No hay elementos.</Caption1>}
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
        icon={items.length > 0 ? <BinRecycleFullFilled /> : <BinRecycleFilled />}
        vertical
        onClick={() => setOpen(true)}
      >
        Papelera
      </ToolbarButton>
    </>
  )
}

export default BinRecycleMenu