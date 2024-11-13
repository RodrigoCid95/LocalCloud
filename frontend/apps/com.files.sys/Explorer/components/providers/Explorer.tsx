import { type FC, type ReactNode, useState, useEffect } from "react"
import { ExplorerContext } from "../../context/explorer"

const ExplorerProvider: FC<ExplorerProviderProps> = ({ children, baseDir, onClose }) => {
  const [items, setItems] = useState<FS.ItemInfo[]>([])
  const [path, setPath] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [isSelectable, setIsSelectable] = useState<boolean>(true)
  const [selections, setSelections] = useState<string[]>([])

  const loadItems = (p: string[]) => {
    setLoading(true)
    setItems([])
    setIsSelectable(false)
    setSelections([])
    const reader = baseDir === 'shared' ? window.connectors.fs.sharedLs : window.connectors.fs.userLs
    reader(p).then(items => {
      if (Array.isArray(items)) {
        setItems(items)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadItems([])
  }, [])

  const go = (p: string[]) => {
    setPath(p)
    loadItems(p)
  }

  const refresh = () => loadItems(path)

  const toggleSelectable = () => {
    if (isSelectable) {
      setSelections([])
    }
    setIsSelectable(!isSelectable)
  }

  const addSelection = (path: string[]) => {
    const newList = [...selections, path.join('|')]
    setSelections(newList)
  }

  const quitSelection = (path: string[]) => {
    const index = selections.indexOf(path.join('|'))
    const newList = [...selections]
    newList.splice(index, 1)
    setSelections(newList)
  }

  return (
    <ExplorerContext.Provider value={{
      items,
      baseDir,
      path,
      loading,
      notFound,
      isSelectable,
      selections,
      addSelection,
      quitSelection,
      toggleSelectable,
      go,
      refresh,
      close: onClose
    }}>
      {children}
    </ExplorerContext.Provider>
  )
}

export default ExplorerProvider

interface ExplorerProviderProps {
  children: ReactNode
  baseDir: 'shared' | 'user'
  onClose: () => void
}