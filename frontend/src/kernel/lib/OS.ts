import Server from "./Server"
import Program from "./Program"
import WindowComponent from "./window"

import './loading'

export default class OS {
  private _server: Server

  public set server(v: Server) {
    this._server = v
    this._server.socket.on('connect', () => {
      this.launchLogin()
      this._server.socket.on('auth/change', auth => {
        if (auth) {
          this.launchDesktop()
        } else {
          this.launchLogin()
        }
      })
    })
  }

  constructor(private mainElement: HTMLElement) {
    this.mainElement.innerHTML = '<app-loading></app-loading>'
  }
  private launchLogin() {
    this.launch({ packageName: 'com.login.app', clearElement: true })
  }
  private launchDesktop() {
    this.launch({ packageName: 'com.desktop.app', clearElement: true })
  }
  private async launch(args: LaunchArguments): Promise<HTMLElement | undefined> {
    const { packageName, containerElement = this.mainElement, clearElement = false } = args
    if (packageName) {
      const packageResult = await import(`/js/apps/${packageName}/main.js`)
      const manifestResult = packageResult.Manifest
      if (manifestResult) {
        const { Main } = await manifestResult.callback()
        if (Main) {
          try {
            const manifest = { ...manifestResult }
            delete manifest.callback
            await Main({ Program, WindowComponent, server: this._server, launch: this.launch.bind(this), manifest })
            if (manifestResult.tag) {
              const programElement = document.createElement(manifestResult.tag)
              if (clearElement) {
                containerElement.innerHTML = ''
              }
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
    } else {
      throw new Error('Falta el argumento "packageName"!')
    }
  }
}

export type LaunchArguments = {
  packageName: string
  containerElement?: HTMLElement
  clearElement?: boolean
}