import type { alertController, loadingController, modalController, pickerController, toastController, menuController, actionSheetController, Config } from '@ionic/core'
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
    Ionic: {
      config: Config
      mode: 'md' | 'ios'
      platforms: string[]
    }
  }
}