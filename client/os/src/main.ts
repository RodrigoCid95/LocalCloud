import { IKernel } from 'builder/types/kernel'
import { IOS } from 'builder/types/os'
import { ISplashScreen } from 'builder/types/os'
import { SplashScreenClass } from './splash-screen'

export default class MainClass implements IOS {
  SplashScreen: ISplashScreen
  constructor(private kernel: IKernel) {
    this.SplashScreen = new SplashScreenClass()
  }
  run(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}