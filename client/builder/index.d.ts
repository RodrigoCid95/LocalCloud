export interface ICipher {
  isEnable(): boolean
  encrypt(key: string, data: string): Promise<string>
  decrypt(key: string, strEncrypted: string): Promise<string>
}
export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
export type SendArguments = {
  path: string
  method: Methods
  data?: any
  encryptRequest?: boolean
  decryptResponse?: boolean
}
export type Callback<T> = (response: T) => void | Promise<void>
export type Response<T> = {
  data: T
  error: {
    message: string
    stack: string
  }
}
export interface IServer {
  onConnect(callback: () => void | Promise<void>): void
  send<T = null>(args: SendArguments): Promise<T>
  emit<T = null>(event: string, data?: object): Promise<T>
  on<T = {}>(event: string, callback: Callback<T>): void
}
export type LaunchArguments = {
  packageName: string
  containerElement?: HTMLElement
  clearElement?: boolean
  args?: { [x: string]: any }
}
type BasedTask = {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly author: string[]
  readonly icon: string
}
export interface IService {
  onKill(): void | Promise<void>
}
export interface ITask extends BasedTask {
  readonly PID: string
  readonly services: IService[]
  readonly type: 'service' | 'program' | 'app'
  readonly element: HTMLElement | IService
  kill(): Promise<void>
}
export interface IServiceTask extends BasedTask {
  service: IService
}
export interface IProgram extends HTMLElement {
  template?: string
}
export interface IServiceManifest extends IManifest<'service'> { }
export type ChildService = Omit<Omit<IServiceManifest, 'services'>, 'type'>
export interface IManifest<T> {
  packageName: string
  title: string
  description?: string
  author?: string[]
  icon?: string
  services: {
    [x: string]: ChildService
  }
  type: T
}
export interface IProgramManifest<T = 'program'> extends IManifest<T> {
  tag: string
}
export interface IAppManifest extends IProgramManifest<'app'> { }
export type ManifestResult = IProgramManifest | IAppManifest | IServiceManifest | undefined
export interface IOS {
  setServer(server: IServer): void
  launch(args: LaunchArguments): Promise<ITask>
  kill(PID: string): void
}
export interface IWindow extends IProgram {
  text: string
  icon: string
  isDraggable: boolean
  isResize: boolean
  minimize: boolean
  width: number
  minWidth: number
  maxWidth: number
  height: number
  minHeight: number
  maxHeight: number
  autoFullScreen: boolean
  readonly isFocus: boolean
  onMount?(): void | Promise<void>
  renderContent?(): string
}
export declare class Program extends HTMLElement implements IProgram { }
export declare class WindowComponent extends Program implements IWindow {
  text: string
  icon: string
  isDraggable: boolean
  isResize: boolean
  minimize: boolean
  width: number
  minWidth: number
  maxWidth: number
  height: number
  minHeight: number
  maxHeight: number
  autoFullScreen: boolean
  readonly isFocus: boolean
  onMount?(): void | Promise<void>
  renderContent?(): string
}
export type ProgramClass = typeof Program
export type WindowClassComponent = typeof WindowComponent
export type AppArguments = {
  manifest: ManifestResult
  WindowComponent: typeof WindowComponent
  getService<S = IService>(): S
  launch: IOS['launch']
  args: { [x: string]: any }
}