import { createContext, useContext } from 'react'

export const ExplorerContext = createContext<{
  items: FS.ItemInfo[],
  baseDir: 'shared' | 'user',
  path: string[],
  loading: boolean,
  notFound: boolean,
  isSelectable: boolean,
  selections: string[],
  addSelection(path: string[]): void,
  quitSelection(path: string[]): void,
  toggleSelectable(): void,
  go(path: string[]): void
  refresh(): void
  close(): void
}>({
  items: [],
  baseDir: 'shared',
  path: [],
  loading: false,
  notFound: false,
  isSelectable: false,
  selections: [],
  addSelection: () => {
    throw new Error('Function not implemented.')
  },
  quitSelection: () => {
    throw new Error('Function not implemented.')
  },
  toggleSelectable: () => {
    throw new Error('Function not implemented.')
  },
  go: () => {
    throw new Error('Function not implemented.')
  },
  refresh: () => {
    throw new Error('Function not implemented.')
  },
  close: () => {
    throw new Error('Function not implemented.')
  }
})

export const useExplorer = () => useContext(ExplorerContext)