import type { loadingController, modalController, pickerController, toastController, menuController, alertController } from '@ionic/core'

export interface GetArgs {
  endpoint: string
  method: 'get'
  params?: { [x: string]: string }
}

export interface PostArgs {
  endpoint: string
  method: 'post'
  data?: string
}

export interface PutArgs {
  endpoint: string
  method: 'put'
  data?: string
}

export interface DeleteArgs {
  endpoint: string
  method: 'delete'
}

export interface ServerConnector {
  readonly encrypting: Encrypting.Class
  send(args: GetArgs): Promise<Response>
  send(args: PostArgs | PutArgs | DeleteArgs): Promise<Response>
}

declare global {
  interface Window {
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    alertController: typeof alertController
    server: ServerConnector
  }
}