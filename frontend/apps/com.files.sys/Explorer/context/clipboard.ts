import { createContext, useContext } from 'react'

export const ClipboardContext = createContext<{
  pendingPaste: boolean,
  copy(path?: string[]): void
  cut(path?: string[]): void
  paste(path?: string[]): void
}>({
  pendingPaste: false,
  copy: () => {
    throw new Error('Function not implemented.')
  },
  cut: () => {
    throw new Error('Function not implemented.')
  },
  paste: () => {
    throw new Error('Function not implemented.')
  },
})

export const useClipboard = () => useContext(ClipboardContext)