import { useCallback, useState, type FC } from "react"
import { Menu, MenuTrigger, Button, MenuPopover, MenuList, MenuItem } from "@fluentui/react-components"
import { ArrowUpload24Filled } from '@fluentui/react-icons'
import UploadItem from "./item"
import { explorerController } from "../../../utils/Explorer"
import { transfers } from "../../../utils/Transfers"

const UploadManager: FC<UploadManagerProps> = () => {
  const [uploads, setUploads] = useState<Transfer[]>(transfers.uploads.list)

  const handleOnUpload = useCallback(() => {
    const path = explorerController.path
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
            transfers.uploads.add({ fileTransfer, name: file.name })
            setUploads([...transfers.uploads.list])
          }
        }
      }
    })
    inputFile.click()
  }, [uploads, setUploads])

  const quitUpload = useCallback((index: number) => {
    transfers.uploads.remove(index)
    setUploads([...transfers.uploads.list])
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
}

export default UploadManager