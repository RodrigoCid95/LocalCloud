import { InitLibrary } from 'bitis/core'
import Cipher from './Cipher'
import AppsManager from './AppsManager'
import FileSystem from './FileSystem'
import SQLite from './SQLite'

const sqliteInstance = new SQLite()
export const cipher: InitLibrary = () => new Cipher()
export const fileSystem: InitLibrary = ({ usersPath }: { usersPath: string }) => new FileSystem(usersPath)
export const appsManager: InitLibrary = ({ usersPath }: { usersPath: string }) => new AppsManager(usersPath, sqliteInstance)
export const sqlite: InitLibrary = () => sqliteInstance