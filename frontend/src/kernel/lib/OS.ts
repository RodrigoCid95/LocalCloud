import { AppManifest, ProgramManifest, ServiceInstance, ServiceManifest } from "types"
import Server from "./Server"
import WindowComponent from "./window"

import './loading'
import Service from "./Service"
import Program from "./Program"

type ServiceTask = {
  packageName: string
  name: string
  service: Service
}
type ServiceTasks = {
  [x: string]: ServiceTask
}
type ProgramTask = {
  packageName: string
  name: string
  program: HTMLElement
  services: ServiceTasks
}
type ProgramTasks = {
  [x: string]: ProgramTask
}
type AppendArguments = {
  tag: string
  packageName: string
  name: string
  PID: string
  ClassCommponent: CustomElementConstructor
  containerElement: HTMLElement
  clearElement: boolean
}
type LaunchArguments = {
  packageName: string
  containerElement?: HTMLElement
  clearElement?: boolean
}
type LaunchServiceArguments = {
  packageName: string
  parentPID?: string
}

const __PROGRAMS__ = Symbol()
const __SERVICES__ = Symbol()
const __SERVER__ = Symbol()
export default class OS {
  [__PROGRAMS__]: ProgramTasks = {};
  [__SERVICES__]: ServiceTasks = {};
  [__SERVER__] = null
  public set server(v: Server) {
    this[__SERVER__] = v
    this[__SERVER__].socket.on('connect', () => {
      this.launchLogin()
      this[__SERVER__].socket.on('auth/change', auth => {
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
  private async getManifest<T>(packageName: string): Promise<T> {
    const packageResult = await import(`/js/apps/${packageName}/main.js`)
    return packageResult.manifest
  }
  public async launchService(args: LaunchServiceArguments) {
    const { packageName, parentPID = '' } = args
    const manifestResult = await this.getManifest<ServiceManifest>(packageName)
    const manifest: Omit<ServiceManifest, 'callback'> = { ...manifestResult }
    delete (manifest as any).callback
    const callbackResult = await manifestResult.callback()
    const ClassService = await callbackResult.default(Service)
    const newServiceTask: ServiceTask = {
      packageName,
      name: manifest.name,
      service: new ClassService({
        server: this[__SERVER__],
        manifest
      })
    }
    const PID = this.generateUUID()
    if (parentPID) {
      this[__PROGRAMS__][parentPID].services[PID] = newServiceTask
    } else {
      this[__SERVICES__][PID] = newServiceTask
    }
  }
  private launchLogin() {
    this.launch({ packageName: 'com.login.app', clearElement: true })
  }
  private launchDesktop() {
    this.launch({ packageName: 'com.desktop.app', clearElement: true })
  }
  private append(args: AppendArguments): HTMLElement {
    const { tag, packageName, name, PID, ClassCommponent, containerElement, clearElement } = args
    if (customElements.get(tag) === undefined) {
      customElements.define(tag, ClassCommponent)
    }
    const resultElement = document.createElement(tag)
    resultElement.addEventListener('onClose', () => delete this[__PROGRAMS__][PID])
    if (clearElement) {
      containerElement.innerHTML = ''
    }
    containerElement.append(resultElement)
    this[__PROGRAMS__][PID] = {
      packageName,
      name,
      program: resultElement,
      services: {}
    }
    return resultElement
  }
  private async launch({ packageName, containerElement = this.mainElement, clearElement = false }: LaunchArguments): Promise<HTMLElement> {
    const manifestResult = await this.getManifest<ProgramManifest | AppManifest>(packageName)
    const PID = this.generateUUID()
    let resultElement: HTMLElement
    if (manifestResult.type === 'app') {
      const manifest: Omit<AppManifest, 'callback'> = { ...manifestResult }
      delete (manifest as any).callback
      const callbackResult = await manifestResult.callback()
      const _this: OS = this
      const ClassCommponent = await callbackResult.default({
        get services(): ServiceInstance[] {
          const programs = _this[__PROGRAMS__]
          const task = programs[PID]
          return task.services as any
        },
        WindowComponent,
        manifest,
        launch: this.launch.bind(this)
      })
      resultElement = this.append({ tag: manifest.tag, packageName, name: manifest.name, PID, ClassCommponent, containerElement, clearElement })
      console.log(`${packageName}(App) =>`, resultElement)
    }
    if (manifestResult.type === 'program') {
      const manifest: Omit<ProgramManifest, 'callback'> = { ...manifestResult }
      delete (manifest as any).callback
      const callbackResult = await manifestResult.callback()
      const ClassCommponent = await callbackResult.default({
        Program,
        WindowComponent,
        services: [],
        manifest,
        launch: this.launch.bind(this),
        launchService: this.launchService.bind(this)
      })
      resultElement = this.append({ tag: manifest.tag, packageName, name: manifest.name, PID, ClassCommponent, containerElement, clearElement })
      console.log(`${packageName}(Program) =>`, resultElement)
    }
    for (const service of manifestResult.services) {
      await this.launchService({ packageName: `${packageName}/${service}`, parentPID: PID })
    }
    return resultElement
  }
  private generateUUID(): string {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }
  public killProgram(PID: string) {
    const task = this[__PROGRAMS__][PID]
    if (task) {
      task.program.remove()
    }
  }
  public killService(PID: string, parentPID: string = '') {
    const task = parentPID === '' ? this[__SERVICES__][PID] : this[__PROGRAMS__][parentPID].services[PID]
    if (task) {
      task.service.onKill()
      if (parentPID) {
        delete this[__SERVICES__]
      } else {
        delete this[__PROGRAMS__][parentPID].services[PID]
      }
    }
  }
}