import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { ArrowLeft24Filled, ArrowClockwise24Filled, Delete24Filled, MultiselectLtr24Filled } from '@fluentui/react-icons'
import { Toolbar, ToolbarButton, ToolbarDivider, ToolbarToggleButton } from '@fluentui/react-components'
import UploadManager from './UploadManager'
import ToolbarClipboard from './Clipboard'
import NewFolder from './NewFolder'
import DownloadManager from './DownloadManager'
import { explorerController } from '../../utils/Explorer'

const ExplorerToolbar: FC<ExplorerToolbarProps> = () => {
  const [selectionLength, setSelectionLength] = useState(explorerController.selections.length)

  useState(() => {
    const update = () => setSelectionLength(explorerController.selections.length)
    explorerController.on('selectionChange', update)
    return () => explorerController.off('selectionChange', update)
  })

  const handleOnDelete = useCallback(async () => {
    const paths = explorerController.selections
      .map(selection => selection.split('/'))
      .map(path => window.connectors.recycleBin.add(path))
    await Promise.all(paths)
    explorerController.path = explorerController.path
  }, [])

  return (
    <Toolbar
      size="small"
    >
      <ToolbarButton
        appearance="subtle"
        aria-label="Back"
        icon={<ArrowLeft24Filled />}
        onClick={() => {
          const newPath = explorerController.path
          newPath.pop()
          explorerController.path = newPath
        }}
      />
      <ToolbarButton
        appearance="subtle"
        aria-label="Refresh"
        icon={<ArrowClockwise24Filled />}
        onClick={() => explorerController.path = explorerController.path}
      />
      <NewFolder />
      <UploadManager />
      <DownloadManager />
      <ToolbarDivider />
      <ToolbarClipboard />
      {selectionLength > 0 && (
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
        onClick={() => explorerController.selectable = !explorerController.selectable}
      />
    </Toolbar>
  )
}

interface ExplorerToolbarProps {
}

export default ExplorerToolbar