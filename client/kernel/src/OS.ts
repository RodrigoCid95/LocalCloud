import { IOS, IServer, IServiceTask, ManifestResult, IService, ITask, LaunchArguments } from "builder"
import WindowComponent from "./components/window"

import Service from "./Service"
import Program from "libs/Program"

const __PROGRAMS__ = Symbol()
const __SERVICES__ = Symbol()
const __SERVER__ = Symbol()
export default class OS implements IOS {
  [__SERVER__]: IServer | null = null;
  [__PROGRAMS__] = [];
  [__SERVICES__] = [];
  constructor(private mainElement: HTMLElement) {}
  setServer(server: IServer): void {
    this[__SERVER__] = server
    this[__SERVER__].onConnect(async () => {
      const { default: callback } = await import('components/login')
      callback(this[__SERVER__])
      this.mainElement.innerHTML = '<app-login></app-login>'
      this[__SERVER__].on<Boolean>('auth/change', async auth => {
        this.mainElement.innerHTML = ''
        if (auth) {
          const loading = await window.loadingController.create({message: 'Cargando escritorio ...'})
          await loading.present()
          const { default: callback } = await import('components/desktop')
          await callback(this[__SERVER__], this.launch.bind(this))
          const appDesktop = document.createElement('app-desktop')
          this.mainElement.append(appDesktop)
          appDesktop.addEventListener('onReady', () => loading.dismiss())
        } else {
          this[__PROGRAMS__] = []
          this[__SERVICES__] = []
          this.mainElement.innerHTML = '<app-login></app-login>'
        }
      })
    })
  }
  public async launch({ packageName, containerElement = this.mainElement, clearElement = false, args = {} }: LaunchArguments): Promise<ITask> {
    const manifest: ManifestResult = await (this[__SERVER__] as IServer).emit<ManifestResult>(`apps-manager user/manifest`, { packageName })
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
    const services: IServiceTask[] = []
    for (const key in manifest.services) {
      if (Object.prototype.hasOwnProperty.call(manifest.services, key)) {
        const {
          title,
          description = 'Sin descripción',
          author = [],
          icon
        } = manifest.services[key]
        const servicePath = manifest.type === 'service' ? `/service/${packageName}/index.js` : `/app/user/${packageName}/services/${key}.js` // `/${manifest.type === 'service' ? 'service' : 'app'}/${packageName}/services/${key}.js`
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
    const k = this.kill.bind(this)
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
      get services(): IService[] {
        return services.map(service => service.service)
      },
      get type() {
        return manifest.type
      },
      get element() {
        return element
      },
      async kill() {
        k(PID)
      }
    }
    if (manifest.type === 'service') {
      const servicePath = `/service/${packageName}/main.js`
      const { default: callback } = await import(servicePath)
      const ClassService: typeof Service = await callback(Service, args)
      element = new ClassService(this[__SERVER__])
      this[__SERVICES__].push(task)
    } else {
      const componentPath = `/app/user/${packageName}/main.js`
      const { default: callback } = await import(componentPath)
      const { [__SERVICES__]: SERVICES } = this
      const callbackArgs = {
        manifest,
        WindowComponent,
        getService(serviceName: string) {
          let service: IService = services.find(({ name }) => name === serviceName)?.service
          if (!service) {
            service = SERVICES.find(({ name }) => name === serviceName)?.service
          }
          return service
        },
        launch: this.launch.bind(this),
        args
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
        const index = this[__PROGRAMS__].findIndex((task: ITask) => task.PID === PID)
        this[__PROGRAMS__].splice(index, 1)
      })
      element.slot = 'app'
      containerElement.append(element)
      this[__PROGRAMS__].push(task)
    }
    return task
  }
  public kill(PID: string) {
    let task: ITask | undefined = this[__PROGRAMS__].find(task => task.PID === PID)
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