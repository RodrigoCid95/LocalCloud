import { useCallback, useState, type FC } from "react"
import { Menu, MenuTrigger, Button, MenuPopover, MenuList, MenuItem } from "@fluentui/react-components"
import { ArrowUpload24Filled } from '@fluentui/react-icons'
import UploadItem from "./item"

const UploadManager: FC<UploadManagerProps> = ({ getPath }) => {
  const [uploads, setUploads] = useState<Transfer[]>(window.uploads.list)

  const handleOnUpload = useCallback(() => {
    const path = getPath()
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.multiple = true
    inputFile.addEventListener('change', () => {
      if (inputFile.files) {
        for (let index = 0; index < inputFile.files.length; index++) {
          const file = inputFile.files.item(index)
          if (file) {
            const p = [...path]
            const base = p.shift()
            const createFileTransfer = base === 'user' ? window.connectors.fs.userUpload : window.connectors.fs.sharedUpload
            const fileTransfer: FileTransfer = createFileTransfer({ path: p, file })
            fileTransfer.start()
            window.uploads.add({ fileTransfer, name: file.name })
            setUploads([...window.uploads.list])
          }
        }
      }
    })
    inputFile.click()
  }, [getPath, uploads, setUploads])

  const quitUpload = useCallback((index: number) => {
    window.uploads.remove(index)
    setUploads([...window.uploads.list])
  }, [setUploads])

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          aria-label="Upload"
          icon={<ArrowUpload24Filled />}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={handleOnUpload}>Subir archivo(s)</MenuItem>
          {uploads.map((upload, index) => <UploadItem key={index} upload={upload.fileTransfer} name={upload.name} onQuit={() => quitUpload(index)} />)}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

interface UploadManagerProps {
  getPath(): string[]
}

export default UploadManager