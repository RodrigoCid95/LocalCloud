import type { FC } from "react"
import { Breadcrumb, BreadcrumbItem, Menu, MenuButton, MenuDivider, MenuItem, MenuList, MenuPopover, MenuTrigger, Overflow, OverflowDivider, OverflowItem, makeStyles, mergeClasses, useIsOverflowGroupVisible, useIsOverflowItemVisible, useOverflowMenu } from "@fluentui/react-components"
import { ChevronRight20Regular } from '@fluentui/react-icons'
import { explorerController } from "../utils/Explorer"

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  resizableArea: {
    padding: '16px',
    borderRadius: '8px',
    position: 'relative',
    resize: 'none',
  },
  breadcrumb: {
    display: 'contents',
    cursor: 'pointer',
  }
})

const OverflowGroupDivider: React.FC<{
  groupId: string
}> = (props) => {
  return (
    <OverflowDivider groupId={props.groupId}>
      <div>
        <ChevronRight20Regular style={{ display: 'flex' }} />
      </div>
    </OverflowDivider>
  )
}

const OverflowMenu: React.FC<OverflowMenuProps> = ({ itemIds, onGo }) => {
  const { ref, isOverflowing } = useOverflowMenu<HTMLButtonElement>()

  if (!isOverflowing) {
    return null
  }

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton appearance="transparent" ref={ref} style={{ minWidth: 'unset' }} />
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {itemIds.map(([i, name], index) => {
            if (typeof i === 'string' && i.startsWith('divider')) {
              const groupId = i.split('-')[1]
              return <OverflowMenuDivider key={index} id={groupId} />
            }
            return (
              <OverflowMenuItem
                key={index}
                id={i.toString()}
                name={name}
                onGo={onGo}
              />
            )
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

const OverflowMenuItem: React.FC<OverflowMenuItemProps> = ({ id, name, onGo }) => {
  const isVisible = useIsOverflowItemVisible(id)

  if (isVisible) {
    return null
  }

  return (
    <MenuItem
      onClick={() => {
        const i = Number(id)
        if (!isNaN(i)) {
          onGo(i)
        }
      }}
    >{name}</MenuItem>
  )
}

const OverflowMenuDivider: React.FC<{
  id: string
}> = (props) => {
  const isGroupVisible = useIsOverflowGroupVisible(props.id)

  if (isGroupVisible === 'visible') {
    return null
  }

  return <MenuDivider />
}

const DirectionBar: FC<DirectionBarProps> = ({ path }) => {
  const itemIdsList: [string, string][] = []
  let count = 0
  for (const _ of path) {
    const id = count.toString()
    itemIdsList.push([id, _])
    if (count < path.length - 1) {
      itemIdsList.push([`divider-${id.toString()}`, _])
    }
    count++
  }
  const styles = useStyles()
  const handleGo = (index?: number) => () => {
    if (index !== undefined) {
      const newPath = explorerController.path
      index++
      newPath.splice(index, newPath.length - (index - 1))
      explorerController.path = newPath
    } else {
      explorerController.path = []
    }
  }
  return (
    <Overflow>
      <Breadcrumb
        className={mergeClasses(styles.container, styles.resizableArea)}
      >
        <div className={styles.breadcrumb}>
          <OverflowItem id={'0'} groupId={'0'}>
            <BreadcrumbItem onClick={handleGo()}>Inicio</BreadcrumbItem>
          </OverflowItem>
        </div>
        <OverflowGroupDivider groupId={'0'} />
        {path.map((item, index) => {
          const id = (index + 1).toString()
          const NAMES: any = { shared: 'Carpeta Compartida', user: 'Carpeta Personal' }
          return (
            <div key={id} className={styles.breadcrumb}>
              <OverflowItem id={id} groupId={id}>
                <BreadcrumbItem onClick={handleGo(index)}>{NAMES[item] || item}</BreadcrumbItem>
              </OverflowItem>
              {index < path.length - 1 && <OverflowGroupDivider groupId={id} />}
            </div>
          )
        })}
        <OverflowMenu
          itemIds={itemIdsList}
          onGo={(i) => handleGo(i)()}
        />
      </Breadcrumb>
    </Overflow>
  )
}

export default DirectionBar

interface OverflowMenuProps {
  itemIds: [string, string][]
  onGo(index: number): void
}

interface OverflowMenuItemProps {
  id: string
  name: string
  onGo(index: number): void
}

interface DirectionBarProps {
  path: string[]
}