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
  interface Downloader extends FileTransfer {
    id: string
    remove(): Promise<void>
  }
  interface Window {
    launchFile(base: 'shared' | 'user', ...path: string[]): void
    launchApp(package_name: string, params?: URLParams): void
    createURL(args: CreateURLArgs): URL
    createDownloader(path: string[]): Downloader
    connectors: Connectors
  }
}

export { }