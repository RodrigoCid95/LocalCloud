import { InitLibrary } from 'bitis/core'
import Cipher from './Cipher'
import FileSystem from './FileSystem'
import AppsManager from './AppsManager'
import SQLite from './SQLite'

export const cipher: InitLibrary = () => new Cipher()
export const fileSystem: InitLibrary = ({ usersPath }: { usersPath: string }) => new FileSystem(usersPath)
export const appsManager: InitLibrary = async ({ usersPath }: { usersPath: string }) => {
  const am = new AppsManager(usersPath, new SQLite(usersPath))
  await am.init()
  return am
}
export const sqlite: InitLibrary = ({usersPath}: {usersPath: string}) => new SQLite(usersPath)