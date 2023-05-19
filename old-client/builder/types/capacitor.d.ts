import { LoadingOptions, ModalOptions, PickerOptions, ToastOptions } from "@ionic/core"
import { IEmmiters } from "./emmiters"
import { ICipher } from "./cipher"
import { IServerConnector } from "./server"
import { ITaskManager } from "./task-manager"

export interface ICapacitor {
  Plugins: {
    Emmiters: IEmmiters,
    Cipher: ICipher,
    ServerConnector: IServerConnector,
    TaskManager: ITaskManager
  }
}
export type LoadingController = {
  create(options: LoadingOptions): Promise<HTMLIonLoadingElement>;
  dismiss(data?: any, role?: string, id?: string): Promise<boolean>;
  getTop(): Promise<HTMLIonLoadingElement | undefined>;
}
export type ModalController = {
  create(options: ModalOptions<import("@ionic/core/dist/types/interface").ComponentRef>): Promise<HTMLIonModalElement>;
  dismiss(data?: any, role?: string, id?: string): Promise<boolean>;
  getTop(): Promise<HTMLIonModalElement | undefined>;
}
export type PickerController = {
  create(options: PickerOptions): Promise<HTMLIonPickerElement>;
  dismiss(data?: any, role?: string, id?: string): Promise<boolean>;
  getTop(): Promise<HTMLIonPickerElement | undefined>;
}
export type ToastController = {
  create(options: ToastOptions): Promise<HTMLIonToastElement>;
  dismiss(data?: any, role?: string, id?: string): Promise<boolean>;
  getTop(): Promise<HTMLIonToastElement | undefined>;
}