import type { FC } from 'react'
import type { ToolbarProps } from '@fluentui/react-components'
import { useCallback, useState } from 'react'
import { ArrowLeft24Filled, ArrowClockwise24Filled, Delete24Filled, MultiselectLtr24Filled } from '@fluentui/react-icons'
import { Toolbar, ToolbarButton, ToolbarDivider, ToolbarToggleButton } from '@fluentui/react-components'
import UploadManager from './UploadManager'
import ToolbarClipboard from './Clipboard'
import NewFolder from './NewFolder'
import DownloadManager from './DownloadManager'

const ExplorerToolbar: FC<ExplorerToolbarProps> = ({ onUp, onChangeSelectable, getPath, onRefresh, selections, path }) => {
  const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({ selectable: [] })
  const onChange: ToolbarProps["onCheckedValueChange"] = (_, { checkedItems }) => {
    setCheckedValues({ selectable: checkedItems })
    onChangeSelectable(checkedItems.includes('selectable'))
  }

  const handleOnDelete = useCallback(async () => {
    for (const selection of selections) {
      await window.connectors.recycleBin.add([...path, selection.name])
    }
    setCheckedValues({ selectable: [] })
    onRefresh()
  }, [selections, path, onRefresh])

  const handleRefresh = useCallback((p?: string[]) => {
    if (Array.isArray(p) && p !== path) {
      return
    }
    setCheckedValues({ selectable: [] })
    onRefresh()
  }, [path, onRefresh, setCheckedValues])

  return (
    <Toolbar
      size="small"
      checkedValues={checkedValues}
      onCheckedValueChange={onChange}
    >
      <ToolbarButton
        appearance="subtle"
        aria-label="Back"
        icon={<ArrowLeft24Filled />}
        onClick={() => {
          setCheckedValues({ selectable: [] })
          onUp()
        }}
      />
      <ToolbarButton
        appearance="subtle"
        aria-label="Refresh"
        icon={<ArrowClockwise24Filled />}
        onClick={handleRefresh as any}
      />
      <NewFolder
        path={path}
        onCreate={handleRefresh}
      />
      <UploadManager getPath={getPath} />
      <DownloadManager />
      <ToolbarDivider />
      <ToolbarClipboard selections={selections} path={path} onPaste={handleRefresh} />
      {selections.length > 0 && (
        <>
          <ToolbarButton
            appearance="subtle"
            aria-label="Delete"
            icon={<Delete24Filled />}
            onClick={handleOnDelete}
          />
          <ToolbarDivider />
        </>
      )}
      <ToolbarToggleButton
        aria-label="Selectable"
        icon={<MultiselectLtr24Filled />}
        name="selectable"
        value='selectable'
      />
    </Toolbar>
  )
}

interface ExplorerToolbarProps {
  onUp(): void
  onRefresh(): void
  onChangeSelectable(selectable: boolean): void
  getPath(): string[]
  selections: FS.ItemInfo[]
  path: string[]
}

export default ExplorerToolbar