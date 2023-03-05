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
export declare class ServiceClass implements IService {
  server: IServer
  onKill(): void | Promise<void>
}
export type TService = typeof ServiceClass
export interface ITask extends BasedTask {
  readonly PID: string
  readonly services: IService[]
  readonly type: 'service' | 'program' | 'app'
  readonly element: HTMLElement | IService
  kill(): void
}
export interface IServiceTask extends BasedTask {
  service: IService
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
export interface IProgramManifest extends IManifest<'program'> {
}
export interface IAppManifest extends IManifest<'app'> { }
export type ManifestResult = IProgramManifest | IAppManifest | IServiceManifest | undefined
export interface IOS {
  launch(args: LaunchArguments): Promise<ITask>
  kill(PID: string): void
}
export interface IWindow extends HTMLElement {
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
}
export declare class WindowComponent extends HTMLElement implements IWindow {
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
}
export type WindowClassComponent = typeof WindowComponent
export type GetService = <S = IService>(serviceNAme: string) => S | undefined
export interface ProgramArguments {
  manifest: ManifestResult
  getService: GetService
  launch: IOS['launch']
  args: { [x: string]: any }
  WindowComponent: typeof WindowComponent
}
export interface IController {
  element: HTMLElement
  getService?: <S = IService>(serviceNAme: string) => S
  onMount: () => void | Promise<void>
}
export declare class ClassController {
  static tag: string
  static template: string
  static shadow?: string
  static css?: CSSStyleSheet
  element: HTMLElement
  getService?: <S = IService>(serviceNAme: string) => S | undefined
  onMount: () => void | Promise<void>
  constructor(args?: { [x: string]: any })
}
export type AppResult = {
  App: typeof ClassController,
  Views?: { [x: string]: typeof ClassController }
}