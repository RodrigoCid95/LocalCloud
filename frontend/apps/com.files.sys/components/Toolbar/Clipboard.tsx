import { useCallback, useEffect, useState, type FC } from "react"
import { ToolbarButton, ToolbarDivider } from "@fluentui/react-components"
import { Cut24Filled, Copy24Filled, ClipboardPaste24Filled } from '@fluentui/react-icons'

const ToolbarClipboard: FC<ToolbarClipboardProps> = ({ selections, path, onPaste }) => {
  const [pendingPaste, setPendingPaste] = useState<boolean>(window.explorerClipboard.pendingPaste)

  useEffect(() => {
    const update = () => setPendingPaste(window.explorerClipboard.pendingPaste)
    window.explorerClipboard.on(update)
    return () => {
      window.explorerClipboard.off(update)
    }
  }, [setPendingPaste])

  const handleCopy = useCallback(() => {
    const items = selections.map(selection => [...path, selection.name])
    window.explorerClipboard.toCopy(items)
  }, [selections, path])

  const handleCut = useCallback(() => {
    const items = selections.map(selection => [...path, selection.name])
    window.explorerClipboard.toCut(items)
  }, [selections, path])

  const handlePaste = useCallback(() => {
    window.explorerClipboard.paste(path).then(() => onPaste(path))
  }, [path])

  return (
    <>
      {selections.length > 0 && (
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
      {(selections.length > 0 || pendingPaste) && <ToolbarDivider />}
    </>
  )
}

interface ToolbarClipboardProps {
  selections: FS.ItemInfo[]
  path: string[]
  onPaste(path: string[]): void
}

export default ToolbarClipboard