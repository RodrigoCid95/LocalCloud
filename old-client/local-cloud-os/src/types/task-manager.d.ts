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
export interface IServiceTask extends BasedTask {
  service: IService
}
export interface ITask extends BasedTask {
  readonly PID: string
  readonly services: IService[]
  readonly type: 'service' | 'program' | 'app'
  readonly element: HTMLElement
  kill(): void
}
export type ITasks = ITask[]
export type LaunchArguments = {
  packageName: string
  containerElement?: HTMLElement
  args?: { [x: string]: any }
}
export interface ITaskManager {
  getTasks(): Promise<ITasks>
  onLaunch(callback: () => void): Promise<void>
  onKill(callback: () => void): Promise<void>
  onLaunchOrKill(callback: () => void): Promise<void>
  launch(args: LaunchArguments): Promise<ITask>
  kill(PID: string): Promise<void>
}
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
export type ChildService = Omit<Omit<IManifest<any>, 'services'>, 'type'>
export interface IAppManifest extends IManifest<'app'> { }
export interface IProgramManifest extends IManifest<'program'> {
}
export type ManifestResult = IProgramManifest | IAppManifest | undefined
export type ServiceResults = { [name: string]: IService }
export declare class ClassController {
  static tag: string
  static template: string
  static shadow?: string
  static css?: CSSStyleSheet
  element: HTMLElement
  getService<T = IService>(nameService: string): T | undefined
  onMount: () => void | Promise<void>
  constructor(args?: { [x: string]: any })
}
export type AppResult = {
  App: typeof ClassController,
  Views?: { [x: string]: typeof ClassController }
}
export interface IWindow extends HTMLElement {
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
export type GetService = <S = IService>(serviceNAme: string) => S
export interface IController {
  element: HTMLElement
  getService?: GetService
  onMount?: () => void | Promise<void>
}