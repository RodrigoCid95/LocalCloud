import { useState } from "react"
import { Button, Caption1, Dialog, DialogActions, DialogBody, DialogContent, DialogOpenChangeData, DialogSurface, DialogTitle, DialogTrigger, Spinner, ToolbarButton } from "@fluentui/react-components"
import { bundleIcon, ShareFilled, ShareMultipleFilled, ShareMultipleRegular, ShareRegular } from '@fluentui/react-icons'
import Item from "./components/Item"

const FilledShared = bundleIcon(ShareMultipleFilled, ShareMultipleRegular)
const EmptyShared = bundleIcon(ShareFilled, ShareRegular)

export default () => {
  const [open, setOpen] = useState<boolean>(false)
  const [items, setItems] = useState<Shared.Shared[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const loadItems = () => {
    setLoading(true)
    window.connectors.shared
      .list()
      .then(items => {
        setItems(items)
        setLoading(false)
      })
  }

  const handleOnClean = async () => {
    setLoading(true)
    for (const Item of items) {
      await window.connectors.shared.delete(Item.id)
    }
    setLoading(false)
    setItems([])
  }

  const handleOnOpenChangle = (_: any, data: DialogOpenChangeData) => {
    setOpen(data.open)
    if (data.open) {
      loadItems()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOnOpenChangle}
    >
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton
          icon={items.length > 0 ? <FilledShared /> : <EmptyShared />}
          vertical
        >
          Archivos Compartidos
        </ToolbarButton>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>Archivos Compartidos</DialogTitle>
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