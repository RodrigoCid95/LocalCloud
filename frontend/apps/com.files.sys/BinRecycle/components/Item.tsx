import { type FC, useState } from "react"
import { Card, CardHeader, Caption1, Button, Text, Spinner } from "@fluentui/react-components"
import { bundleIcon, DeleteArrowBackFilled, DeleteArrowBackRegular, DeleteFilled, DeleteRegular } from '@fluentui/react-icons'

const RestoreIcon = bundleIcon(DeleteArrowBackFilled, DeleteArrowBackRegular)
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular)

const Item: FC<ItemProps> = ({ item, onRemove }) => {
  const [loading, setLoading] = useState<boolean>(false)

  const p = [...item.path]
  const base = p.shift()

  const handleOnRestore = () => {
    setLoading(true)
    window.connectors.recycleBin
      .restore(item.id)
      .then(() => {
        setLoading(false)
        onRemove()
      })
  }

  const handleOnDelete = () => {
    setLoading(true)
    window.connectors.recycleBin
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
        description={<Caption1>{item.date}</Caption1>}
        action={
          loading
            ? <Spinner />
            : (
              <div style={{ display: 'flex' }}>
                <Button
                  appearance="transparent"
                  icon={<RestoreIcon />}
                  aria-label="Restore"
                  onClick={handleOnRestore}
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
    </Card>
  )
}

export default Item

interface ItemProps {
  item: RecycleBin.Item
  onRemove(): void
}