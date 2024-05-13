import '@ionic/core'
import { actionSheetController, loadingController, menuController, modalController, pickerController, setupConfig, toastController, alertController } from '@ionic/core'

/**
 * The code to be executed should be placed within a default function that is
 * exported by the global script. Ensure all of the code in the global script
 * is wrapped in the function() that is exported.
 */
export default async () => {
  setupConfig(JSON.parse(localStorage.getItem('ion-config') || '{}'))
  Object.defineProperty(window, 'actionSheetController', { value: actionSheetController, writable: false })
  Object.defineProperty(window, 'loadingController', { value: loadingController, writable: false })
  Object.defineProperty(window, 'modalController', { value: modalController, writable: false })
  Object.defineProperty(window, 'pickerController', { value: pickerController, writable: false })
  Object.defineProperty(window, 'toastController', { value: toastController, writable: false })
  Object.defineProperty(window, 'menuController', { value: menuController, writable: false })
  Object.defineProperty(window, 'alertController', { value: alertController, writable: false })
  if ('connectors' in window) {
    document.dispatchEvent(new CustomEvent('onReady'))
  }
}