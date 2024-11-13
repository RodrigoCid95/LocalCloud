import { createContext, useContext } from 'react'

export const DownloadsContext = createContext<{
  downloads: Download[],
  addDownload: (path: string[]) => void,
  quitDownload: (index: number) => void,
}>({
  downloads: [],
  addDownload() {
    throw new Error('Function not implemented.')
  },
  quitDownload() {
    throw new Error('Function not implemented.')
  },
})

export const useDownloads = () => useContext(DownloadsContext)