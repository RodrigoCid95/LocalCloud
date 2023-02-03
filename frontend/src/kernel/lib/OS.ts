import { AppManifest, ProgramManifest, Task, ServiceManifest, ServiceTask, ProgramArguments, AppArguments } from "types"
import Server from "./Server"
import WindowComponent from "./window"

import './loading'
import Service from "./Service"
import Program from "./Program"

type LaunchArguments = {
  packageName: string
  containerElement?: HTMLElement
  clearElement?: boolean
}

const __PROGRAMS__ = Symbol()
const __SERVICES__ = Symbol()
const __SERVER__ = Symbol()
export default class OS {
  [__SERVER__] = null;
  [__PROGRAMS__] = [];
  [__SERVICES__] = [];
  public set server(v: Server) {
    this[__SERVER__] = v
    this[__SERVER__].socket.on('connect', async () => {
      await this.launch({ packageName: 'com.login.app', clearElement: true })
      this[__SERVER__].socket.on('auth/change', async (auth: boolean) => {
        if (auth) {
          await this.launch({ packageName: 'com.desktop.app', clearElement: true })
        } else {
          this[__PROGRAMS__] = []
          this[__SERVICES__] = []
          await this.launch({ packageName: 'com.login.app', clearElement: true })
        }
      })
    })
  }
  constructor(private mainElement: HTMLElement) {
    this.mainElement.innerHTML = '<app-loading></app-loading>'
  }
  private async launch({ packageName, containerElement = this.mainElement, clearElement = false }: LaunchArguments): Promise<Task> {
    const manifest: ProgramManifest | AppManifest | ServiceManifest | undefined = (await new Promise(resolve => this[__SERVER__].socket.emit('app', packageName, resolve)) as any).data as any
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
        const servicePath = `/js/${manifest.type === 'service' ? 'services' : 'apps'}/${packageName}/services/${key}.js`
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
      const servicePath = `/js/services/${packageName}/index.js`
      const { default: callback } = await import(servicePath)
      const ClassService: typeof Service = await callback(Service)
      element = new ClassService(this[__SERVER__])
      this[__SERVICES__].push(task)
    } else {
      const componentPath = `/js/apps/${packageName}/index.js`
      const { default: callback } = await import(componentPath)
      const { [__SERVICES__]: SERVICES } = this
      const args = {
        manifest,
        WindowComponent,
        getService(serviceName: string) {
          let service: Service = services.find(({ name }) => name === serviceName)?.service
          if (!service) {
            service = SERVICES.find(({ name }) => name === serviceName)?.service
          }
          return service
        },
        launch: this.launch.bind(this)
      }
      if (manifest.type === 'program') {
        args['Program'] = Program
      }
      if (customElements.get(manifest.tag) === undefined) {
        const ClassCommponent = await callback(args)
        customElements.define(manifest.tag, ClassCommponent)
      }
      element = document.createElement(manifest.tag)
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