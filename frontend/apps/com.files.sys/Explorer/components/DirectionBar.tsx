import { useRef, useEffect } from 'react'
import { makeStyles, Button, tokens } from '@fluentui/react-components'
import { bundleIcon, HomeFilled, HomeRegular, ChevronRight20Filled, ChevronRight20Regular, FolderPeopleFilled, FolderPeopleRegular, FolderPersonFilled, FolderPersonRegular } from '@fluentui/react-icons'
import { useExplorer } from './../context/explorer'

const HomeIcon = bundleIcon(HomeFilled, HomeRegular)
const SharedDirIcon = bundleIcon(FolderPeopleFilled, FolderPeopleRegular)
const UserDirIcon = bundleIcon(FolderPersonFilled, FolderPersonRegular)
const SeparatorIcon = bundleIcon(ChevronRight20Filled, ChevronRight20Regular)
const useStyles = makeStyles({
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    overflow: 'auto',
    scrollBehavior: 'smooth'
  },
  item: {
    display: 'contents'
  },
  button: {
    minWidth: 'fit-content',
    padding: '0'
  },
  icon: {
    minWidth: 'fit-content',
  }
})

const BASE_DIR_NAMES = {
  shared: 'Carpeta compartida',
  user: 'Carpeta personal'
}

export default () => {
  const styles = useStyles()
  const refContainer = useRef<HTMLDivElement>(null)
  const { close, baseDir, path, go } = useExplorer()

  useEffect(() => {
    const scrollToEnd = () => refContainer.current!.scrollLeft = refContainer.current!.scrollWidth
    const observer = new MutationObserver(scrollToEnd)
    observer.observe(refContainer.current!, { childList: true })
    return () => observer.disconnect()
  }, [refContainer])

  return (
    <div ref={refContainer} className={styles.content}>
      <Button className={styles.button} appearance='transparent' icon={<HomeIcon />} onClick={close}>
        Inicio
      </Button>
      <SeparatorIcon className={styles.icon} />
      <Button className={styles.button} appearance='transparent' icon={baseDir === 'shared' ? <SharedDirIcon /> : <UserDirIcon />} onClick={() => go([])}>
        {BASE_DIR_NAMES[baseDir]}
      </Button>
      {path.length > 0 && <SeparatorIcon className={styles.icon} />}
      {path.map((item, index) => (
        <div key={index} className={styles.item}>
          <Button className={styles.button} appearance='transparent' onClick={() => go(path.slice(0, index + 1))}>
            {item}
          </Button>
          {index < path.length - 1 && <SeparatorIcon className={styles.icon} />}
        </div>
      ))}
    </div>
  )
}