import '@ionic/core'
import { actionSheetController, loadingController, menuController, modalController, toastController, alertController } from '@ionic/core'

export default async () => document.addEventListener('onConnectorReady', async () => {
  Object.defineProperty(window, 'actionSheetController', { value: actionSheetController, writable: false })
  Object.defineProperty(window, 'loadingController', { value: loadingController, writable: false })
  Object.defineProperty(window, 'modalController', { value: modalController, writable: false })
  Object.defineProperty(window, 'toastController', { value: toastController, writable: false })
  Object.defineProperty(window, 'menuController', { value: menuController, writable: false })
  Object.defineProperty(window, 'alertController', { value: alertController, writable: false })
  document.dispatchEvent(new CustomEvent('onReady'))
})