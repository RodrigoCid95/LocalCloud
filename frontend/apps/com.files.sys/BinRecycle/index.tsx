import { useState } from 'react'
import { type DialogOpenChangeData, Button, Caption1, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Spinner, ToolbarButton } from '@fluentui/react-components'
import { BinRecycleFilled, BinRecycleFullFilled, BinRecycleFullRegular, BinRecycleRegular, bundleIcon } from '@fluentui/react-icons'
import Item from './components/Item'

const FilledBinRecycle = bundleIcon(BinRecycleFullFilled, BinRecycleFullRegular)
const EmptyBinRecycle = bundleIcon(BinRecycleFilled, BinRecycleRegular)

export default () => {
  const [open, setOpen] = useState<boolean>(false)
  const [items, setItems] = useState<RecycleBin.Item[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const loadItems = () => {
    setLoading(true)
    window.connectors.recycleBin
      .list()
      .then(items => {
        setItems(items)
        setLoading(false)
      })
  }

  const handleOnClean = () => {
    setLoading(true)
    window.connectors.recycleBin
      .clean()
      .then(() => {
        setLoading(false)
        setItems([])
        setOpen(false)
      })
  }

  const handleOnOpenChange = (_: any, data: DialogOpenChangeData) => {
    setOpen(data.open)
    if (data.open) {
      loadItems()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOnOpenChange}
    >
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton
          icon={items.length > 0 ? <FilledBinRecycle /> : <EmptyBinRecycle />}
          vertical
        >
          Papelera
        </ToolbarButton>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>Papelera de reciclaje</DialogTitle>
        <DialogBody>
          <DialogContent>
            {items.map((item, index) => <Item key={index} item={item} onRemove={loadItems} />)}
            {items.length === 0 && <Caption1>No hay elementos.</Caption1>}
          </DialogContent>
          <DialogActions style={{ marginTop: '16px', marginBottom: '16px' }}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cerrar</Button>
            </DialogTrigger>
            {
              loading
                ? <Spinner />
                : items.length > 0 ? <Button appearance="primary" onClick={handleOnClean}>Vaciar</Button> : null
            }
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}