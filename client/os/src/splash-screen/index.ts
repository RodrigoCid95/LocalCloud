import { ISplashScreen } from 'builder/types/os'

import './component'

export class SplashScreenClass implements ISplashScreen {
  async render() {
    return '<os-splash-screen></os-splash-screen>'
  }
}