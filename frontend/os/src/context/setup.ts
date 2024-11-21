import { createContext, useContext } from 'react'

export const SetupContext = createContext<{
  activeIndex: number
  user: User
  password: string
  uid: Users.User['uid']
  files: File[]
  setActiveIndex: (index: number) => void
  setUser: (userName: User) => void
  setPassword: (password: string) => void
  setUid: (uid: Users.User['uid']) => void
  setFiles: (files: File[]) => void
}>({
  activeIndex: 0,
  user: {
    name: '',
    existent: false
  },
  password: '',
  uid: 0,
  files: [],
  setActiveIndex: () => {
    throw new Error('Function not implemented.')
  },
  setUser: () => {
    throw new Error('Function not implemented.')
  },
  setPassword: () => {
    throw new Error('Function not implemented.')
  },
  setUid: () => {
    throw new Error('Function not implemented.')
  },
  setFiles: () => {
    throw new Error('Function not implemented.')
  }
})

export interface User {
  name: string
  existent: boolean
}

export const useSetupContext = () => useContext(SetupContext)