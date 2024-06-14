import { useCallback, useEffect, useState, type FC } from "react"
import { Button, Spinner, Title1 } from "@fluentui/react-components"
import Toolbar from './../Toolbar'
import Item from "./Item"
import './Explorer.css'

const emitter = window.createEmitter()

const Explorer: FC<ExplorerProps> = ({ path, onGo }) => {
  const [items, setItems] = useState<Items>({
    dirs: [],
    files: []
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [waitSelection, setWaitSelection] = useState<boolean>(false)
  const [selections, setSelections] = useState<FS.ItemInfo[]>([])

  const loadItems = useCallback((dir?: string) => {
    const p = dir ? [...path, dir] : [...path]
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
  }, [setItems, setNotFound, setLoading, path])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleOnGo = useCallback((dir: string) => {
    const p = [...path, dir]
    onGo(p)
    loadItems(dir)
    setSelections([])
  }, [onGo, loadItems, path, setSelections])

  const handleOnLaunch = useCallback((name: string) => {
    const p = [...path, name]
    window.launchFile(p.shift() as any, ...p)
  }, [path])

  const handleOnUp = useCallback(() => {
    const p = [...path]
    p.pop()
    onGo(p)
  }, [path, onGo])

  const handleOnRefresh = useCallback(() => {
    onGo([...path])
    setSelections([])
    setWaitSelection(false)
    emitter.emit()
  }, [path, onGo, setSelections, setWaitSelection])

  const handleOnReload = useCallback((p: string[]) => {
    const strP = p.join('|')
    const strPath = path.join('|')
    if (strP === strPath) {
      handleOnRefresh()
    }
  }, [path, handleOnRefresh])

  const handleOnSelected = useCallback((item: FS.ItemInfo, value: boolean) => {
    if (waitSelection) {
      const s = [...selections]
      if (value) {
        s.push(item)
        setSelections(s)
      } else {
        const index = s.findIndex(selection => selection === item)
        s.splice(index, 1)
        setSelections(s)
      }
    }
  }, [waitSelection, selections, setSelections])

  const getPath = useCallback(() => [...path], [path])

  if (loading) {
    return <Spinner style={{ marginTop: '16px' }} />
  } else {
    if (notFound) {
      return (
        <div className='not-found'>
          <Title1>Ruta no encontrada.</Title1>
          <Button onClick={() => onGo([])}>Inicio</Button>
        </div>
      )
    }
    return (
      <>
        {path.length > 0 && (
          <Toolbar
            onUp={handleOnUp}
            onRefresh={handleOnRefresh}
            onChangeSelectable={setWaitSelection}
            getPath={getPath}
            selections={selections}
            path={path}
          />
        )}
        <div className='explorer'>
          {items.dirs.map((item, index) => (
            <Item
              key={index}
              item={item}
              waitSelection={waitSelection}
              onGo={handleOnGo}
              onChangeSelection={value => handleOnSelected(item, value)}
              path={path}
              onReload={handleOnReload}
              emitter={emitter}
            />
          ))}
          {items.files.map((item, index) => (
            <Item
              key={index}
              item={item}
              waitSelection={waitSelection}
              onLaunch={handleOnLaunch}
              onChangeSelection={value => handleOnSelected(item, value)}
              path={path}
              onReload={handleOnReload}
              emitter={emitter}
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
  path: string[]
  onGo: (newPath: string[]) => void
}