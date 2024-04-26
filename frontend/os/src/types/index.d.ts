import type { alertController, loadingController, modalController, pickerController, toastController, menuController } from '@ionic/core'

declare global {
  interface Window {
    alertController: typeof alertController
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
  }
}