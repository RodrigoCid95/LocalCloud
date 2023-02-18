import { AppManifest, ProgramManifest, Task, ServiceManifest, ServiceTask } from "types"
import Server from "./Server"
import WindowComponent from "./window"

import './loading'
import Service from "./Service"
import Program from "./Program"

type LaunchArguments = {
  packageName: string
  containerElement?: HTMLElement
  clearElement?: boolean
  args?: { [x: string]: any }
}
type ManifestResult = ProgramManifest | AppManifest | ServiceManifest | undefined

const __PROGRAMS__ = Symbol()
const __SERVICES__ = Symbol()
const __SERVER__ = Symbol()
export default class OS {
  [__SERVER__]: Server | null = null;
  [__PROGRAMS__] = [];
  [__SERVICES__] = [];
  public set server(v: Server) {
    this[__SERVER__] = v
    this[__SERVER__].onConnect(async () => {
      await this.launch({ packageName: 'com.login.app', clearElement: true }, true)
      this[__SERVER__].on<Boolean>('auth/change', async auth => {
        if (auth) {
          await this.launch({ packageName: 'com.desktop.app', clearElement: true }, true)
        } else {
          this[__PROGRAMS__] = []
          this[__SERVICES__] = []
          await this.launch({ packageName: 'com.login.app', clearElement: true }, true)
        }
      })
    })
  }
  constructor(private mainElement: HTMLElement) {
    this.mainElement.innerHTML = '<app-loading></app-loading>'
  }
  private async launch({ packageName, containerElement = this.mainElement, clearElement = false, args = {} }: LaunchArguments, systemApp = false): Promise<Task> {
    const manifest: ManifestResult = await (this[__SERVER__] as Server).emit<ManifestResult>('apps-manager find', { packageName, systemApp })
    if (!manifest) {
      throw new Error(`El paquete ${packageName} no existe!`)
    }
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now()
    }
    const PID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    const services: ServiceTask[] = []
    for (const key in manifest.services) {
      if (Object.prototype.hasOwnProperty.call(manifest.services, key)) {
        const {
          title,
          description = 'Sin descripción',
          author = [],
          icon
        } = manifest.services[key]
        const servicePath = manifest.type === 'service' ? `/service/${packageName}/index.js` : `/app/${systemApp ? 'system' : 'user'}/${packageName}/services/${key}.js` // `/${manifest.type === 'service' ? 'service' : 'app'}/${packageName}/services/${key}.js`
        const { default: callback } = await import(servicePath)
        const ClassService: typeof Service = await callback(Service)
        let service: Service = new ClassService(this[__SERVER__])
        services.push({
          get name() {
            return key
          },
          get title() {
            return title
          },
          get description() {
            return description
          },
          get author() {
            return author
          },
          get icon() {
            return icon
          },
          get service() {
            return service
          }
        })
      }
    }
    let element: HTMLElement | Service
    const task = {
      get PID(): string {
        return PID
      },
      get name(): string {
        return packageName
      },
      get title(): string {
        return manifest.title
      },
      get description(): string {
        return manifest?.description || 'Sin descripción.'
      },
      get author(): string[] {
        return manifest?.author || []
      },
      get icon(): string {
        return manifest.icon
      },
      get services(): Service[] {
        return services.map(service => service.service)
      },
      get type() {
        return manifest.type
      },
      get element() {
        return element
      },
      async kill() {
      }
    }
    if (manifest.type === 'service') {
      const servicePath = `/service/${packageName}/index.js`
      const { default: callback } = await import(servicePath)
      const ClassService: typeof Service = await callback(Service, args)
      element = new ClassService(this[__SERVER__])
      this[__SERVICES__].push(task)
    } else {
      const componentPath = `/app/${systemApp ? 'system' : 'user'}/${packageName}/index.js`
      const { default: callback } = await import(componentPath)
      const { [__SERVICES__]: SERVICES } = this
      const callbackArgs = {
        manifest,
        WindowComponent,
        getService(serviceName: string) {
          let service: Service = services.find(({ name }) => name === serviceName)?.service
          if (!service) {
            service = SERVICES.find(({ name }) => name === serviceName)?.service
          }
          return service
        },
        launch: this.launch.bind(this),
        args: { a: 1, b: 2 }
      }
      if (manifest.type === 'program') {
        callbackArgs['Program'] = Program
      }
      const ClassCommponent = await callback(callbackArgs)
      if (customElements.get(manifest.tag) === undefined) {
        customElements.define(manifest.tag, ClassCommponent)
      }
      element = document.createElement(manifest.tag);
      (element as any).icon = manifest.icon
      if (clearElement) {
        containerElement.innerHTML = ''
      }
      element.addEventListener('onClose', () => {
        const index = this[__PROGRAMS__].findIndex((task: Task) => task.PID === PID)
        this[__PROGRAMS__].splice(index, 1)
      })
      containerElement.append(element)
      this[__PROGRAMS__].push(task)
    }
    return task
  }
  public kill(PID: string) {
    let task: Task | undefined = this[__PROGRAMS__].find(task => task.PID === PID)
    if (task) {
      for (const service of task.services) {
        service?.onKill()
      }
      (task.element as HTMLElement).remove()
    } else {
      task = this[__SERVICES__].find(task => task.PID === PID)
      if (task) {
        for (const service of task.services) {
          service?.onKill()
        }
        (task.element as Service)?.onKill()
      }
    }
  }
}