import type { alertController, loadingController, modalController, pickerController, toastController, menuController, actionSheetController } from '@ionic/core'
import './../../../backend/connector/types'

declare global {
  interface Window {
    alertController: typeof alertController
    loadingController: typeof loadingController
    modalController: typeof modalController
    pickerController: typeof pickerController
    toastController: typeof toastController
    menuController: typeof menuController
    actionSheetController: typeof actionSheetController
  }
}