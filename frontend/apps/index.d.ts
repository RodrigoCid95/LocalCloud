import type { alertController, loadingController, modalController, pickerController, toastController, menuController, actionSheetController } from '@ionic/core'

interface FileUploader {
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
  start(): void
  cancel(): void
}
interface ServerConector {
  createUploader(opts: CreateUploaderArgs): FileUploader
  launchFile(base: 'shared' | 'user', ...path: string[]): void
  launchApp(package_name: string, params: URLParams): void
  send<R = Object>({ endpoint, method, params, data: body }: SendArgs): Promise<R>
  createURL(opts: CreateURLArgs): URL 
}

interface URLParams {
  [key: string]: string
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
  path: string[]
  file: FileOptions | FileOptions[]
  metadata?: MetaData
}

interface FileOptions {
  name: string
  file: File
}

interface MetaData {
  [x: string]: string
}

declare global {
  interface Window {
    actionSheetController: typeof actionSheetController
    alertController: typeof alertController
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    server: ServerConector
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
    api: string
    justification: string
    active: boolean
  }
  interface Source {
    id: number
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
}