import type { loadingController, modalController, pickerController, toastController, menuController } from '@ionic/core'
import type { Server } from "./system/core/server"

declare global {
  interface Window {
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    loadCore(): Promise<void>
    server: Server
    key: string
    token?: string
  }
}