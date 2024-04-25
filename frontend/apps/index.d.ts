import type { alertController, loadingController, modalController, pickerController, toastController, menuController, actionSheetController, Config } from '@ionic/core'

interface ServerConector {
  createUploader(opts: CreateUploaderArgs): FileTransfer
  createDownloader(...path: string[]): FileTransfer
  launchFile(base: 'shared' | 'user', ...path: string[]): void
  launchApp(package_name: string, params: URLParams): void
  send<R = Object>({ endpoint, method, params, data: body }: SendArgs): Promise<R>
  createURL(opts: CreateURLArgs): URL 
}

interface URLParams {
  [key: string]: string | number | boolean
}

interface SendArgs {
  endpoint: string
  method: 'get' | 'post' | 'put' | 'delete'
  params?: URLParams
  data?: string
}

interface CreateURLArgs {
  path: string[]
  params?: URLParams
}

interface CreateUploaderArgs {
  api?: 'fs' | 'apps'
  path: string[]
  file: FileOptions | FileOptions[]
  metadata?: MetaData
}

interface CreateDownloaderArgs {
  path: string[]
  file: string
}

interface FileOptions {
  name: string
  file: File
}

interface MetaData {
  [x: string]: string
}

declare global {
  interface FileTransfer {
    on(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
    off(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
    start(): void
    cancel(): void
  }
  interface Window {
    actionSheetController: typeof actionSheetController
    alertController: typeof alertController
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    server: ServerConector
    Ionic: {
      config: Config
    }
  }
  interface User {
    uuid: string
    full_name: string
    user_name: string
    photo: string
    email: string
    phone: string
  }
  interface Permission {
    id: number
    package_name: string
    api: string
    justification: string
    active: boolean
  }
  interface Source {
    id: number
    package_name: string
    type: string
    source: string
    justification: string
    active: boolean
  }
  interface App {
    package_name: string
    title: string
    description: string
    author: string
    permissions: Permission[]
    secureSources: Source[]
  }
  interface FileInfo {
    name: string
    size: number
    lastModification: Date
    creationDate: Date
    isFile: boolean
  }
  interface Shared {
    id: string
    uuid: string
    path: string[]
  }
  interface RecycleBinItem {
    id: string
    uuid: string
    path: string[]
    date: string
  }
}