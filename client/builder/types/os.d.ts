import { IKernel } from "./kernel"

export type SplashScreenResult = string | HTMLElement
export interface ISplashScreen {
  render(): SplashScreenResult | Promise<SplashScreenResult>
}
export interface ISplashScreenClass {
  new(): ISplashScreen
}
export interface IOS {
  SplashScreen: ISplashScreen
  run(): Promise<void>
}
export interface IOSClass {
  new(kernel: IKernel): IOS
}