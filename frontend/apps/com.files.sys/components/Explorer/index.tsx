import { useCallback, useEffect, useState, type FC } from "react"
import { Button, Spinner, Title1, Title3 } from "@fluentui/react-components"
import Toolbar from './../Toolbar'
import Item from "./Item"
import './Explorer.css'
import { explorerController } from "../../utils/Explorer"
import { clipboardController } from "../../utils/Clipboard"

const Explorer: FC<ExplorerProps> = () => {
  const [items, setItems] = useState<Items>({
    dirs: [],
    files: []
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [notFound, setNotFound] = useState<boolean>(false)

  const loadItems = useCallback(() => {
    setLoading(true)
    const p = explorerController.path
    const baseDir = p.shift()
    const reader = baseDir === 'shared' ? window.connectors.fs.sharedLs : window.connectors.fs.userLs
    reader(p).then(response => {
      if (Array.isArray(response)) {
        setItems({
          dirs: response.filter(item => !item.isFile),
          files: response.filter(item => item.isFile)
        })
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
  }, [setItems, setNotFound, setLoading])

  useEffect(() => {
    loadItems()
    const handleOnPaste = (path: any) => {
      if (path.join('/') === explorerController.path.join('/')) {
        loadItems()
      }
    }
    explorerController.on('change', loadItems)
    clipboardController.on('paste', handleOnPaste)
    return () => {
      explorerController.off('change', loadItems)
      clipboardController.off('paste', handleOnPaste)
    }
  }, [loadItems])

  const handleOnLaunch = useCallback((name: string) => {
    const p = [...explorerController.path, name]
    window.launchFile(p.shift() as any, ...p)
  }, [])

  if (loading) {
    return <Spinner style={{ marginTop: '16px' }} />
  } else {
    if (notFound) {
      return (
        <div className='not-found'>
          <Title1>Ruta no encontrada.</Title1>
          <Button onClick={() => explorerController.path = []}>Inicio</Button>
        </div>
      )
    }
    return (
      <>
        {explorerController.path.length > 0 && (
          <Toolbar />
        )}
        <div className='explorer'>
          {items.dirs.length === 0 && items.files.length === 0 && (
            <Title3 style={{ textAlign: 'center', width: '100%' }}>No hay nada por acá.</Title3>
          )}
          {items.dirs.map((item, index) => (
            <Item
              key={index}
              item={item}
            />
          ))}
          {items.files.map((item, index) => (
            <Item
              key={index}
              item={item}
              onLaunch={handleOnLaunch}
            />
          ))}
        </div>
      </>
    )
  }
}

export default Explorer


interface Items {
  dirs: FS.ItemInfo[]
  files: FS.ItemInfo[]
}

interface ExplorerProps {
}