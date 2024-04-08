import '@ionic/core'
import { actionSheetController, loadingController, menuController, modalController, pickerController, setupConfig, toastController, alertController } from '@ionic/core'

export default async () => {
  setupConfig(JSON.parse(localStorage.getItem('ion-config') || '{}'))
  Object.defineProperty(window, 'actionSheetController', { value: actionSheetController, writable: false })
  Object.defineProperty(window, 'loadingController', { value: loadingController, writable: false })
  Object.defineProperty(window, 'modalController', { value: modalController, writable: false })
  Object.defineProperty(window, 'pickerController', { value: pickerController, writable: false })
  Object.defineProperty(window, 'toastController', { value: toastController, writable: false })
  Object.defineProperty(window, 'menuController', { value: menuController, writable: false })
  Object.defineProperty(window, 'alertController', { value: alertController, writable: false })
  const loading = await loadingController.create({ message: 'Cargando...' })
  await loading.present()
  const connectorPath = `${location.pathname === '/' ? '' : location.pathname}/connector.js`
  const { ServerConector } = await import(connectorPath)
  Object.defineProperty(window, 'server', { value: new ServerConector(), writable: false })
  await loading.dismiss()
  document.dispatchEvent(new CustomEvent('onReady'))
}