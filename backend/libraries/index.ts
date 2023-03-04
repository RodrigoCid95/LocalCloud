import { InitLibrary } from 'bitis/core'
import Cipher from './Cipher'
import FileSystem from './FileSystem'
import SQLite from './SQLite'

const sqliteInstance = new SQLite()
export const cipher: InitLibrary = () => new Cipher()
export const fileSystem: InitLibrary = ({ baseDir }: { baseDir: string }) => new FileSystem(baseDir)
export const sqlite: InitLibrary = () => sqliteInstance