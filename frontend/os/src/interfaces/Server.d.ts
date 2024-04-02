import type { alertController, loadingController, modalController, pickerController, toastController, menuController } from '@ionic/core'

interface ServerConector {
  send(args: SendArgs): Promise<Response>
}

interface SendArgs {
  endpoint: string
  method: 'get' | 'post' | 'put' | 'delete'
  data?: string
  params?: object
}

declare global {
  interface Window {
    alertController: typeof alertController
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    server: ServerConector
  }
}