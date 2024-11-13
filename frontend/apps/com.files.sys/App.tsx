import { lazy, useState, useEffect, Suspense } from "react"
import { makeStyles, Spinner, Toolbar, ToolbarButton } from "@fluentui/react-components"
import { bundleIcon, FolderPeopleFilled, FolderPeopleRegular, FolderPersonFilled, FolderPersonRegular } from '@fluentui/react-icons'
import BinRecycle from "./BinRecycle"
import Shared from "./Shared"

const Explorer = lazy(() => import('./Explorer'))
const SharedDirIcon = bundleIcon(FolderPeopleFilled, FolderPeopleRegular)
const UserDirIcon = bundleIcon(FolderPersonFilled, FolderPersonRegular)
const useStyles = makeStyles({
  initial: {
    minWidth: '100%',
    minHeight: '100dvh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const mediaQuery = window.matchMedia('(max-width: 560px)')

const App = () => {
  const styles = useStyles()
  const [verticalToolbar, setVerticalToolbar] = useState<boolean>(mediaQuery.matches)
  const [baseDir, setBaseDir] = useState<BaseDir>('user')

  useEffect(() => {
    mediaQuery.addEventListener('change', e => setVerticalToolbar(e.matches))
  }, [])

  if (baseDir) {
    return (
      <Suspense fallback={<Spinner className='center-middle' size='huge' />}>
        <Explorer baseDir={baseDir} onClose={() => setBaseDir('')} />
      </Suspense>
    )
  } else {
    return (
      <div className={styles.initial}>
        <Toolbar vertical={verticalToolbar} size='large'>
          <ToolbarButton
            icon={<SharedDirIcon />}
            vertical
            onClick={() => setBaseDir('shared')}
          >
            Carpeta compartida
          </ToolbarButton>
          <ToolbarButton
            icon={<UserDirIcon />}
            vertical
            onClick={() => setBaseDir('user')}
          >
            Carpeta Personal
          </ToolbarButton>
          <BinRecycle />
          <Shared />
        </Toolbar>
      </div>
    )
  }
}

export default App

type BaseDir = 'user' | 'shared' | ''