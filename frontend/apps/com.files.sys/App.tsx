import { lazy, useState, Suspense, useEffect, useCallback } from "react"
import { Spinner, Toolbar, ToolbarButton } from "@fluentui/react-components"
import { FolderPeopleFilled, FolderPersonFilled } from '@fluentui/react-icons'
import DirectionBar from "./components/DirectionBar"
import BinRecycleMenu from "./components/BinRecycleMenu"
import SharedMenu from "./components/SharedMenu"
import { explorerController } from "./utils/Explorer"
import './App.css'

const Explorer = lazy(() => import('./components/Explorer'))

const App = () => {
  const mediaQuery = window.matchMedia('(max-width: 560px)')
  const [verticalToolbar, setVerticalToolbar] = useState<boolean>(mediaQuery.matches)
  const [path, setPath] = useState<string[]>([])

  const handleGo = useCallback(() => setPath(explorerController.path), [setPath])

  useEffect(() => {
    mediaQuery.addEventListener('change', e => setVerticalToolbar(e.matches))
    explorerController.on('change', handleGo)
    return () => {
      explorerController.on('change', handleGo)
    }
  }, [setVerticalToolbar])

  if (path.length === 0) {
    return (
      <div className="initial">
        <Toolbar vertical={verticalToolbar} size='large'>
          <ToolbarButton
            icon={<FolderPeopleFilled />}
            vertical
            onClick={() => explorerController.path = ['shared']}
          >
            Carpeta compartida
          </ToolbarButton>
          <ToolbarButton
            icon={<FolderPersonFilled />}
            vertical
            onClick={() => explorerController.path = ['user']}
          >
            Carpeta Personal
          </ToolbarButton>
          <BinRecycleMenu />
          <SharedMenu />
        </Toolbar>
      </div>
    )
  } else {
    return (
      <>
        <DirectionBar path={path} />
        <Suspense fallback={<Spinner style={{ marginTop: '16px' }} />}>
          <Explorer />
        </Suspense>
      </>
    )
  }
}

export default App