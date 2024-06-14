import type { FC } from "react"
import { makeStyles, tokens, Card, CardHeader, Text, Caption1, Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components"
import { MoreHorizontal20Regular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  card: {
    width: "260px",
    maxWidth: "100%",
    height: "fit-content",
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
  delete: {
    color: tokens.colorStatusDangerBorder2,
    ':hover': {
      color: tokens.colorStatusDangerBorderActive
    },
    ':active': {
      color: tokens.colorStatusDangerBorder1,
    }
  },
})

const Item: FC<ItemProps> = ({ user, onEdit, onApps, onDelete }) => {
  const styles = useStyles()

  return (
    <Card className={styles.card} orientation="vertical">
      <CardHeader
        header={<Text weight="semibold">{user.name}</Text>}
        description={<Caption1 className={styles.caption}>{user.full_name}</Caption1>}
        action={(
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="transparent"
                icon={<MoreHorizontal20Regular />}
                aria-label="More options"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={onEdit}>Editar</MenuItem>
                <MenuItem onClick={onApps}>Aplicaciones</MenuItem>
                <MenuItem className={styles.delete} onClick={onDelete}>Eliminar</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
      />
    </Card>
  )
}

interface ItemProps {
  user: Users.User
  onEdit(): void
  onApps(): void
  onDelete(): void
}

export default Item