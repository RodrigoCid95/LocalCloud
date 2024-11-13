import { createContext, useContext } from 'react'

export const RenameContext = createContext<{
  addToRename: (path: string[]) => void
}>({
  addToRename: () => {
    throw new Error('addToRename not implemented')
  }
})

export const useRename = () => useContext(RenameContext)