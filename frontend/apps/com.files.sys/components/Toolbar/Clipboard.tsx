import { useCallback, useEffect, useState, type FC } from "react"
import { ToolbarButton, ToolbarDivider } from "@fluentui/react-components"
import { Cut24Filled, Copy24Filled, ClipboardPaste24Filled } from '@fluentui/react-icons'
import { explorerController } from "../../utils/Explorer"
import { clipboardController } from "../../utils/Clipboard"

const ToolbarClipboard: FC<ToolbarClipboardProps> = () => {
  const [pendingPaste, setPendingPaste] = useState<boolean>(clipboardController.pendingPaste)
  const [selectionsLength, setSelectionsLength] = useState<number>(explorerController.selections.length)

  useEffect(() => {
    const update = () => {
      setPendingPaste(clipboardController.pendingPaste)
      setSelectionsLength(explorerController.selections.length)
    }
    clipboardController.on('change', update)
    explorerController.on('selectionChange', update)
    return () => {
      clipboardController.off('change', update)
      explorerController.off('selectionChange', update)
    }
  }, [setPendingPaste, setSelectionsLength])

  const handleCopy = useCallback(() => {
    clipboardController.copy(explorerController.selections)
  }, [])

  const handleCut = useCallback(() => {
    clipboardController.cut(explorerController.selections)
  }, [])

  const handlePaste = useCallback(() => {
    clipboardController.paste(explorerController.path)
  }, [])

  return (
    <>
      {selectionsLength > 0 && (
        <>
          <ToolbarButton
            appearance="subtle"
            aria-label="Cut"
            icon={<Cut24Filled />}
            onClick={handleCut}
          />
          <ToolbarButton
            appearance="subtle"
            aria-label="Copy"
            icon={<Copy24Filled />}
            onClick={handleCopy}
          />
        </>
      )}

      {pendingPaste && (
        <ToolbarButton
          appearance="subtle"
          aria-label="Paste"
          icon={<ClipboardPaste24Filled />}
          onClick={handlePaste}
        />
      )}
      {(selectionsLength > 0 || pendingPaste) && <ToolbarDivider />}
    </>
  )
}

interface ToolbarClipboardProps {
}

export default ToolbarClipboard