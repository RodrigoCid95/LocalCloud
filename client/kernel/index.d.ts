import { loadingController as LoadingController, modalController as ModalController, pickerController as PickerController, toastController as ToastController } from '@ionic/core'
import OS from "./src/OS"
import { Server } from "./src/types"

declare global {
  interface Window {
    os: OS
    server: Server
    loadingController: typeof LoadingController
    modalController: typeof ModalController
    pickerController: typeof PickerController
    toastController: typeof ToastController
  }
}