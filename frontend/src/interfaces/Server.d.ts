import type { loadingController, modalController, pickerController, toastController, menuController } from '@ionic/core'

export interface GetArgs {
  endpoint: string
  method: 'get'
  params?: { [x: string]: string }
}

export interface PostArgs<T = {}> {
  endpoint: string
  method: 'post'
  data?: T
}

export interface PutArgs<T = {}> {
  endpoint: string
  method: 'put'
  data?: T
}

export interface DeleteArgs {
  endpoint: string
  method: 'delete'
}

export interface ServerConnector {
  send<R = {}>(args: GetArgs): Promise<R>
  send<T = {}>(args: PostArgs<T> | PutArgs<T> | DeleteArgs): Promise<void>
}

declare global {
  interface Window {
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    server: ServerConnector
  }
}