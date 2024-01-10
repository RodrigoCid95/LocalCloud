import { GetService } from './service'

export declare class ViewController<C = any> {
  static styles: CSSStyleSheet[]
  static template: string
  static shadowTemplate: string
  static shadow: boolean
  static readonly instancesCount: number
  readonly viewElement: HTMLElement
  readonly containerElement: C
  getService: GetService
  onMount?(): void | Promise<void>
  onClose?(): void | Promise<void>
}
export declare class ViewControllerConstructable<C = any> {
  static styles: CSSStyleSheet[]
  static template: string
  static shadowTemplate: string
  static shadow: boolean
  static readonly instancesCount: number
  new(): ViewController<C>
}
export type ViewModule = { default: ViewControllerConstructable }
export type LoadViewModule = () => Promise<ViewModule>
export type LoadView = LoadViewModule
export type OtherViews = {
  [x: Lowercase<string>]: ViewControllerConstructable | LoadViewModule
}
export type ViewsModule = {
  prefix: Lowercase<string>
  Index: ViewControllerConstructable
  others?: OtherViews
}