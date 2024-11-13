import { type FC, useRef, useCallback } from "react"
import { makeStyles, Button, Text, Caption1, tokens, ToggleButton } from "@fluentui/react-components"
import { bundleIcon, DocumentFilled, DocumentRegular, FolderFilled, FolderRegular } from '@fluentui/react-icons'
import { useExplorer } from './../context/explorer'
import { useDownloads } from './../context/downloads'
import { useOptions } from './../context/options'

const FolderIcon = bundleIcon(FolderFilled, FolderRegular)
const FileIcon = bundleIcon(DocumentFilled, DocumentRegular)
const useStyles = makeStyles({
  button: {
    width: '100%',
    justifyContent: 'flex-start',
    gap: '8px',
    '@media (min-width: 426px)': {
      width: 'fit-content',
      maxWidth: '220px',
    },
  },
  icon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    color: tokens.colorNeutralForeground1,
    textWrap: 'wrap',
    maxWidth: '146px',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  }
})

const Item: FC<ItemProps> = ({ item }) => {
  const styles = useStyles()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { baseDir, path, go, isSelectable, selections, addSelection, quitSelection } = useExplorer()
  const { addDownload } = useDownloads()
  const { addReference } = useOptions()

  const handleOnClick = () => {
    if (item.isFile) {
      addDownload([...path, item.name])
      window.launchFile(baseDir, ...[...path, item.name])
    } else {
      go([...path, item.name])
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + unidades[i]
  }

  const handleOnChangeChecked = () => {
    const newPath = [baseDir, ...path, item.name]
    const index = selections.findIndex(selection => selection === newPath.join('|'))
    if (index > -1) {
      quitSelection(newPath)
    } else {
      addSelection(newPath)
    }
  }

  const handleOnContextMenu = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    addReference({
      fileInfo: item,
      target: buttonRef.current
    })
  }, [buttonRef])

  if (isSelectable) {
    return (
      <ToggleButton
        className={styles.button}
        appearance="outline"
        icon={item.isFile ? <FileIcon /> : <FolderIcon />}
        onClick={handleOnChangeChecked}
      >
        <Text className={styles.text}>
          {item.name}
        </Text>
      </ToggleButton>
    )
  } else {
    return (
      <Button
        ref={buttonRef}
        className={styles.button}
        appearance='outline'
        onClick={handleOnClick}
        title={item.isFile ? `${item.name} (${formatSize(item.size)})` : item.name}
        onContextMenu={handleOnContextMenu}
      >
        <div className={styles.icon}>
          {item.isFile ? <FileIcon /> : <FolderIcon />}
          <Caption1>
            {item.isFile ? formatSize(item.size) : ''}
          </Caption1>
        </div>
        <Text className={styles.text}>
          {item.name}
        </Text>
      </Button>
    )
  }
}

export default Item

interface ItemProps {
  item: FS.ItemInfo
}