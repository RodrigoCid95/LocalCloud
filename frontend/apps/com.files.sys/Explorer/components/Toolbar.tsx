import { useExplorer } from "./../context/explorer"
import { makeStyles, ToggleButton, tokens, Toolbar, ToolbarButton, ToolbarDivider } from "@fluentui/react-components"
import { bundleIcon, ArrowUpFilled, ArrowUpRegular, ArrowClockwiseFilled, ArrowClockwiseRegular, MultiselectLtrFilled, MultiselectLtrRegular, DeleteFilled, DeleteRegular, CutFilled, CutRegular, CopyFilled, CopyRegular, ClipboardPasteFilled, ClipboardPasteRegular } from "@fluentui/react-icons"
import New from './New'
import Uploads from './Uploads'
import Downloads from './Downloads'
import { useClipboard } from "../context/clipboard"

const CutIcon = bundleIcon(CutFilled, CutRegular)
const CopyIcon = bundleIcon(CopyFilled, CopyRegular)
const PasteIcon = bundleIcon(ClipboardPasteFilled, ClipboardPasteRegular)
const BackIcon = bundleIcon(ArrowUpFilled, ArrowUpRegular)
const RefreshIcon = bundleIcon(ArrowClockwiseFilled, ArrowClockwiseRegular)
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular)
const SelectIcon = bundleIcon(MultiselectLtrFilled, MultiselectLtrRegular)
const useStyles = makeStyles({
  toolbar: {
    padding: '0',
    paddingTop: tokens.spacingVerticalL
  }
})

const Clipboard = () => {
  const { selections } = useExplorer()
  const { copy, cut, pendingPaste, paste } = useClipboard()

  return (
    <>
      {selections.length > 0 && (
        <>
          <ToolbarButton
            appearance="subtle"
            aria-label="Copy"
            icon={<CopyIcon />}
            onClick={copy}
          />
          <ToolbarButton
            appearance="subtle"
            aria-label="Cut"
            icon={<CutIcon />}
            onClick={cut}
          />
        </>
      )}
      {pendingPaste && (
        <ToolbarButton
          appearance="subtle"
          aria-label="Paste"
          icon={<PasteIcon />}
          onClick={paste}
        />
      )}
      {(selections.length > 0 || pendingPaste) && <ToolbarDivider />}
    </>
  )
}

export default () => {
  const styles = useStyles()
  const { path, go, refresh, selections, isSelectable, toggleSelectable } = useExplorer()

  const handleOnDelete = async () => {
    for (const selection of selections) {
      const pathToDelete = selection.split('|')
      const rm = pathToDelete[0] === 'shared' ? window.connectors.fs.sharedRm : window.connectors.fs.userRm
      pathToDelete.shift()
      await rm(pathToDelete)
      refresh()
    }
    toggleSelectable()
  }

  return (
    <Toolbar className={styles.toolbar}>
      {path.length > 0 && (
        <ToolbarButton
          appearance="subtle"
          aria-label="Back"
          icon={<BackIcon />}
          onClick={() => {
            const newPath = [...path]
            newPath.pop()
            go(newPath)
          }}
        />
      )}
      <ToolbarButton
        appearance="subtle"
        aria-label="Refresh"
        icon={<RefreshIcon />}
        onClick={refresh}
      />
      <New />
      <Uploads />
      <Downloads />
      <ToolbarDivider />
      <Clipboard />
      {
        selections.length > 0
          ? (
            <>
              <ToolbarButton
                appearance="subtle"
                aria-label="delete"
                icon={<DeleteIcon />}
                onClick={handleOnDelete}
              />
              <ToolbarDivider />
            </>
          )
          : null
      }
      <ToggleButton
        appearance='outline'
        icon={<SelectIcon />}
        checked={isSelectable}
        onClick={toggleSelectable}
      />
    </Toolbar>
  )
}