import './server'
import './apis'

declare global {
  interface FileOptions {
    name: string
    file: File
  }

  interface MetaData {
    [x: string]: string
  }
}