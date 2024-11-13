import { type FC, useState } from "react"
import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components"
import DirectionBar from './components/DirectionBar'
import Toolbar from './components/Toolbar'
import List from './components/List'
import ClipboardProvider from "./components/providers/Clipboard"
import DownloadsProvider from "./components/providers/Downloads"
import ExplorerProvider from "./components/providers/Explorer"
import UploadsProvider from "./components/providers/Uploads"
import { useExplorer } from "./context/explorer"
import { useUploads } from "./context/uploads"

const useStyles = makeStyles({
  container: {
    paddingTop: tokens.spacingVerticalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
    paddingLeft: tokens.spacingHorizontalXXL,
    minHeight: '100dvh',
  },
  containerDragging: {
    ':before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1,
    },
    ':after': {
      content: '"Subir aquí"',
      color: 'white',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2,
    }
  }
})

const Explorer = () => {
  const styles = useStyles()
  const [dragging, setDragging] = useState(false)
  const { baseDir, path } = useExplorer()
  const { addUpload } = useUploads()

  const handleOnDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleOnDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }

  const readFileEntry = (entry: FileSystemFileEntry) => entry.file(file => {
    const p = entry.fullPath.split('/')
    p.shift()
    p.pop()
    const newPath = [baseDir, ...path, ...p]
    setTimeout(() => {
      addUpload(newPath, file)
    }, 100)
  })

  const readDirectoryEntry = (entry: FileSystemDirectoryEntry) => {
    const reader = entry.createReader()
    reader.readEntries((entries: FileSystemEntry[]) => {
      readEntries(entries)
    })
  }

  const readEntries = (entries: FileSystemEntry[]) => {
    for (const entry of entries) {
      if (entry.isFile) {
        readFileEntry(entry as FileSystemFileEntry)
      } else if (entry.isDirectory) {
        readDirectoryEntry(entry as FileSystemDirectoryEntry)
      }
    }
  }

  const handleOnDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const { items } = e.dataTransfer
    const entries = []
    for (const item of items) {
      const entry = item.webkitGetAsEntry()
      if (entry) entries.push(entry)
    }
    readEntries(entries)
    setDragging(false)
  }

  return (
    <div
      className={mergeClasses(styles.container, dragging && styles.containerDragging)}
      onDragEnter={handleOnDragEnter}
      onDragOver={e => e.preventDefault()}
      onDragLeave={handleOnDragLeave}
      onDrop={handleOnDrop}
    >
      <DirectionBar />
      <Toolbar />
      <List />
    </div>
  )
}

const ExplorerContainer: FC<ExplorerProps> = (props) => (
  <ExplorerProvider {...props}>
    <ClipboardProvider>
      <DownloadsProvider>
        <UploadsProvider>
          <Explorer />
        </UploadsProvider>
      </DownloadsProvider>
    </ClipboardProvider>
  </ExplorerProvider>
)

export default ExplorerContainer

interface ExplorerProps {
  baseDir: 'shared' | 'user'
  onClose: () => void
}