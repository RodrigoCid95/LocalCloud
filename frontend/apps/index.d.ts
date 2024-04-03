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
}