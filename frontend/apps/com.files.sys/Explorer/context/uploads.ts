import { createContext, useContext } from 'react'

export const UploadsContext = createContext<{
  uploads: Transfer[],
  addUpload: (path: string[], file: File) => void,
  quitUpload: (index: number) => void,
}>({
  uploads: [],
  addUpload: () => {
    throw new Error('Function not implemented.')
  },
  quitUpload: () => {
    throw new Error('Function not implemented.')
  },
})

export const useUploads = () => useContext(UploadsContext)