import '@ionic/core'
import { loadingController, menuController, modalController, pickerController, setupConfig, toastController } from '@ionic/core'

export default async () => {
  setupConfig(JSON.parse(localStorage.getItem('ion-config') || '{}'))
  Object.defineProperty(window, 'loadingController', { value: loadingController, writable: false })
  Object.defineProperty(window, 'modalController', { value: modalController, writable: false })
  Object.defineProperty(window, 'pickerController', { value: pickerController, writable: false })
  Object.defineProperty(window, 'toastController', { value: toastController, writable: false })
  Object.defineProperty(window, 'menuController', { value: menuController, writable: false })
  const loading = await loadingController.create({ message: 'Cargando...' })
  await loading.present()
  const { ServerController } = await import('./server')
  Object.defineProperty(window, 'server', { value: new ServerController(), writable: false })
  await loading.dismiss()
  document.body.innerHTML = '<app-root></app-root>'
}
