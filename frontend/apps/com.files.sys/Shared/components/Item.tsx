import { FC, useState } from "react"
import { useId, useToastController, Toast, ToastTitle, ToastTrigger, Link, Card, CardHeader, Button, Toaster, Text, Spinner } from "@fluentui/react-components"
import { bundleIcon, CopyFilled, CopyRegular, DeleteFilled, DeleteRegular } from '@fluentui/react-icons'

const CopyIcon = bundleIcon(CopyFilled, CopyRegular)
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular)

const Item: FC<ItemProps> = ({ item, onRemove }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  const p = [...item.path]
  const base = p.shift()

  const handleOnCopyLink = () => {
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
  }

  const handleOnDelete = () => {
    setLoading(true)
    window.connectors.shared
      .delete(item.id)
      .then(() => {
        setLoading(false)
        onRemove()
      })
  }

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">{base === 'user' ? 'Carpeta personal' : 'Carpeta compartida'} &gt; {p.join(' > ')}</Text>}
        action={
          loading
            ? <Spinner />
            : (
              <div style={{ display: 'flex' }}>
                <Button
                  appearance="transparent"
                  icon={<CopyIcon />}
                  aria-label="Restore"
                  onClick={handleOnCopyLink}
                />
                <Button
                  appearance="transparent"
                  icon={<DeleteIcon />}
                  aria-label="Delete"
                  onClick={handleOnDelete}
                />
              </div>
            )
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

export default Item

interface ItemProps {
  item: Shared.Shared
  onRemove(): void
}