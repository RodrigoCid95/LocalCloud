import { type FC, useState, useCallback, useEffect } from "react"
import { Button, Menu, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components"
import { ArrowDownload24Filled } from '@fluentui/react-icons'
import DownloadItem from "../UploadManager/item"

const DownloadManager: FC<DownloadManagerProps> = () => {
  const [downloads, setDownloads] = useState<Transfer[]>(window.downloads.list)

  useEffect(() => {
    const update = () => setDownloads([...window.downloads.list])
    window.downloads.on(update)
    return () => {
      window.downloads.off(update)
    }
  }, [setDownloads])

  const quitUpload = useCallback((index: number) => {
    window.downloads.remove(index)
    setDownloads([...window.downloads.list])
  }, [setDownloads])

  if (downloads.length > 0) {
    return (
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            aria-label="Download"
            icon={<ArrowDownload24Filled />}
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {downloads.map((download, index) => <DownloadItem key={index} upload={download.fileTransfer} name={download.name} onQuit={() => quitUpload(index)} />)}
          </MenuList>
        </MenuPopover>
      </Menu>
    )
  }
}

interface DownloadManagerProps {
}

export default DownloadManager