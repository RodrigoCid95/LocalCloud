import { type FC, type ReactNode, useState } from "react"
import { useExplorer } from "../../context/explorer"
import { UploadsContext } from "../../context/uploads"

const UploadsProvider: FC<UploadsProviderProps> = ({ children }) => {
  const { refresh } = useExplorer()
  const [uploads, setUploads] = useState<Transfer[]>([])


  const addUpload = (path: string[], file: File) => {
    const baseDir = path.shift()
    const createUploader = baseDir === 'user' ? window.connectors.fs.userUpload : window.connectors.fs.sharedUpload
    const fileTransfer = createUploader({ path, file })
    const p = [...path]
    fileTransfer.addEventListener('end', () => {
      if (p.join('|') === path.join('|')) {
        refresh()
      }
    })
    fileTransfer.start()
    setUploads(oldUploads => [...oldUploads, { name: file.name, fileTransfer }])
  }

  const quitUpload = (index: number) => {
    setUploads(oldUploads => {
      const newUploads = [...oldUploads]
      newUploads.splice(index, 1)
      return newUploads
    })
  }

  return (
    <UploadsContext.Provider value={{ uploads, addUpload, quitUpload }}>
      {children}
    </UploadsContext.Provider>
  )
}

export default UploadsProvider

interface UploadsProviderProps {
  children: ReactNode
}