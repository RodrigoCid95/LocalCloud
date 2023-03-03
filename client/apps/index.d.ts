import { loadingController as LoadingController, modalController as ModalController, pickerController as PickerController, toastController as ToastController } from '@ionic/core'
import { IOS, IServer } from "builder"

declare global {
  interface Window {
    os: IOS
    server: IServer
    loadingController: typeof LoadingController
    modalController: typeof ModalController
    pickerController: typeof PickerController
    toastController: typeof ToastController
  }
}