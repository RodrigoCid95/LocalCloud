import { createContext, useContext } from 'react'

export const OptionsContext = createContext<{
  reference?: Reference
  addReference: (reference: Reference) => void
}>({
  addReference: () => {
    throw new Error('Function not implemented.')
  }
})

export const useOptions = () => useContext(OptionsContext)

export interface Reference {
  fileInfo: FS.ItemInfo
  target: React.RefObject<HTMLButtonElement>['current']
}