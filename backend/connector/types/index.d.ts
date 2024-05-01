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
  interface Window {
    launchFile(base: 'shared' | 'user', ...path: string[]): void
    launchApp(package_name: string, params: URLParams): void
    createURL(args: CreateURLArgs): URL
    createDownloader(path: string[]): FileTransfer
    connectors: Connectors
  }
}