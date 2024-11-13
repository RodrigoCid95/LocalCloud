import { type FC, type ReactNode, useState } from "react"
import { DownloadsContext } from "../../context/downloads"
import { useExplorer } from "../../context/explorer"

const DownloadsProvider: FC<DownloadsProviderProps> = ({ children }) => {
  const { baseDir } = useExplorer()
  const [downloads, setDownloads] = useState<Download[]>([])

  const addDownload = (path: string[]) => {
    const downloader = window.createDownloader([baseDir, ...path])
    const download: Download = {
      name: path[path.length - 1],
      fileTransfer: downloader
    }
    setDownloads([...downloads, download])
    download.fileTransfer.start()
  }

  const quitDownload = (index: number) => {
    const newDownloads = [...downloads]
    newDownloads.splice(index, 1)
    setDownloads(newDownloads)
  }

  return (
    <DownloadsContext.Provider value={{ downloads, addDownload, quitDownload }}>
      {children}
    </DownloadsContext.Provider>
  )
}

export default DownloadsProvider

interface DownloadsProviderProps {
  children: ReactNode
}