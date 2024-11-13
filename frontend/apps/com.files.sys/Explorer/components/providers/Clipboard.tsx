import { type FC, type ReactNode, useState } from "react"
import { ClipboardContext } from "../../context/clipboard"
import { useExplorer } from "../../context/explorer"

const ClipboardProvider: FC<ClipboardProviderProps> = ({ children }) => {
  const [pendingPaste, setPendingPaste] = useState<boolean>(false)
  const [isCopy, setIsCopy] = useState<boolean>(true)
  const [sources, setSources] = useState<string[]>([])
  const { isSelectable, toggleSelectable, selections, baseDir, path, refresh } = useExplorer()

  const copy = (path?: string[]) => {
    if (path) {
      setSources([path.join('|')])
    } else {
      setSources([...selections])
    }
    setIsCopy(true)
    setPendingPaste(true)
    if (isSelectable) {
      toggleSelectable()
    }
  }

  const cut = (path?: string[]) => {
    if (path) {
      setSources([path.join('|')])
    } else {
      setSources([...selections])
    }
    setIsCopy(false)
    setPendingPaste(true)
    if (isSelectable) {
      toggleSelectable()
    }
  }

  const paste = async (p?: string[]) => {
    setPendingPaste(false)
    const action = isCopy ? window.connectors.fs.copy : window.connectors.fs.move
    for (const selection of sources) {
      await action(selection.split('|'), p || [baseDir, ...path])
      refresh()
    }
    setSources([])
  }

  return (
    <ClipboardContext.Provider value={{ pendingPaste, copy, cut, paste }}>
      {children}
    </ClipboardContext.Provider >
  )
}

export default ClipboardProvider

interface ClipboardProviderProps {
  children: ReactNode
}