import Server from "./Server"
import Program from "./Program"
import WindowComponent from "./window"

import './loading'

export default class OS {

  constructor(private mainElement: HTMLElement, private server: Server) {
    this.mainElement.innerHTML = '<app-loading></app-loading>'
    this.server.socket.on('connect', () => {
      this.launchLogin()
      this.server.socket.on('auth/change', auth => {
        if (auth) {
          this.launchDesktop()
        } else {
          this.launchLogin()
        }
      })
    })
  }
  private launchLogin() {
    this.mainElement.innerHTML = ''
    this.launch('com.login.app')
  }
  private launchDesktop() {
    this.mainElement.innerHTML = ''
    this.launch('com.desktop.app')
  }
  private async launch(packageName: string, containerElement: HTMLElement = this.mainElement): Promise<HTMLElement | undefined> {
    const packageResult = await import(`/js/apps/${packageName}/main.js`)
    const manifestResult = packageResult.Manifest
    if (manifestResult) {
      const { Main } = await manifestResult.callback()
      if (Main) {
        try {
          const manifest = { ...manifestResult }
          delete manifest.callback
          await Main({ Program, WindowComponent, server: this.server, launch: this.launch.bind(this), manifest })
          if (manifestResult.tag) {
            const programElement = document.createElement(manifestResult.tag)
            containerElement.append(programElement)
            console.log(packageName, '=>', programElement)
            return programElement
          }
        } catch (error) {
          console.error(error)
        }
      } else {
        throw new Error(`El programa ${packageName} no es válido!`)
      }
    } else {
      throw new Error(`El programa ${packageName} no está instalado!`)
    }
  }
}