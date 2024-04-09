import type { alertController, loadingController, modalController, pickerController, toastController, menuController, actionSheetController } from '@ionic/core'

interface FileOptions {
  name: string
  file: File
}

interface MetaData {
  [x: string]: string
}

interface FileUploader {
  on(event: 'progress', callback: (progress: number) => void): void
  on(event: 'end', callback: (response: any) => void): void
  on(event: 'end' | 'error' | 'abort', callback: () => void): void
  start(): void
  cancel(): void
}

interface LaunchAppParams {
  [key: string]: string | number | boolean
}

interface ServerConector {
  send(args: SendArgs): Promise<Response>
  createUploader(endpoint: string, file: FileOptions, metadata?: MetaData): FileUploader
  createURL(...path: string[]): URL
  launchApp(package_name: string, params?: LaunchAppParams): void
  launchFile(base: 'shared' | 'user', ...path: string[]): void
}

interface SendArgs {
  endpoint: string
  method: 'get' | 'post' | 'put' | 'delete'
  data?: string
  params?: object
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