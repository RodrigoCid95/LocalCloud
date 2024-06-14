import { type FC } from "react"
import { Toolbar, ToolbarButton } from "@fluentui/react-components"
import { ArrowClockwise24Filled, PersonAdd24Filled } from '@fluentui/react-icons'

const UsersToolbar: FC<UsersToolbarProps> = ({ onReload, onNew }) => {
  return (
    <Toolbar>
        <ToolbarButton
          aria-label="Refresh"
          appearance="subtle"
          icon={<ArrowClockwise24Filled />}
          onClick={onReload}
        />
        <ToolbarButton
          aria-label="Install"
          appearance="subtle"
          icon={<PersonAdd24Filled />}
          onClick={() => onNew()}
        />
      </Toolbar>
  )
}

interface UsersToolbarProps {
  onReload(): void
  onNew(): void
}

export default UsersToolbar