import type { FC } from "react"
import { Menu, MenuTrigger, Button, MenuPopover, MenuList, MenuItem, makeStyles, tokens } from "@fluentui/react-components"
import { MoreHorizontal20Regular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  delete: {
    color: tokens.colorStatusDangerBorder2,
    ':hover': {
      color: tokens.colorStatusDangerBorderActive
    },
    ':active': {
      color: tokens.colorStatusDangerBorder1,
    }
  }
})

const Options: FC<OptionsProps> = ({ onUpdate, onPermissions, onSecureSources, onUninstall }) => {
  const styles = useStyles()

  return (
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
          <MenuItem onClick={onUpdate}>Actualizar</MenuItem>
          <MenuItem onClick={onPermissions}>Permisos</MenuItem>
          <MenuItem onClick={onSecureSources}>Fuentes seguras</MenuItem>
          <MenuItem className={styles.delete} onClick={onUninstall}>Desinstalar</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

interface OptionsProps {
  onUpdate(): void
  onPermissions(): void
  onSecureSources(): void
  onUninstall(): void
}

export default Options