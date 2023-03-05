import { IOS, IServer, IServiceTask, ManifestResult, IService, ITask, LaunchArguments, IWindow, AppResult, ClassController } from "builder"
import WindowComponent from "./components/window"

import Service from "./Service"

const __PROGRAMS__ = Symbol()
const __SERVICES__ = Symbol()
export default class OS implements IOS {
  [__PROGRAMS__] = [];
  [__SERVICES__] = [];
  constructor(private mainElement: HTMLElement, private server: IServer) { }
  public async launch({ packageName, containerElement = this.mainElement, args = {} }: LaunchArguments): Promise<ITask> {
    const manifest: ManifestResult = await this.server.emit<ManifestResult>(`apps manifest`, { packageName })
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
        const servicePath = manifest.type === 'service' ? `/service/${packageName}/index.js` : `/app/${packageName}/services/${key}.js` // `/${manifest.type === 'service' ? 'service' : 'app'}/${packageName}/services/${key}.js`
        const { default: callback } = await import(servicePath)
        const ClassService: typeof Service = await callback(Service)
        let service: Service = new ClassService(this.server)
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
    const kill = this.kill.bind(this)
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
      kill() {
        kill(PID)
      }
    }
    const getService = (serviceName: string) => {
      const { [__SERVICES__]: SERVICES } = this
      let service: IService | undefined = services.find(({ name }) => name === serviceName)?.service
      if (!service) {
        service = SERVICES.find(({ name }) => name === serviceName)?.service
      }
      return service
    }
    if (manifest.type === 'service') {
      const servicePath = `/service/${packageName}/main.js`
      const { default: callback } = await import(servicePath)
      const ClassService: typeof Service = await callback(Service, args)
      element = new ClassService(this.server)
      this[__SERVICES__].push(task)
    } else {
      const { type } = manifest
      const componentPath = `/app/${packageName}/main.js`
      const { App, Views }: AppResult = await import(componentPath)
      const defineComponent = (Controller: typeof ClassController) => {
        if (window.customElements.get(Controller.tag) === undefined) {
          window.customElements.define(Controller.tag, class extends HTMLElement {
            constructor() {
              super()
              if (Controller.shadow) {
                this.attachShadow({ mode: 'open' })
              }
            }
            connectedCallback() {
              if (Controller.shadow) {
                this.shadowRoot.innerHTML = Controller.shadow
              }
              if (Controller.css) {
                this.shadowRoot.adoptedStyleSheets.push(Controller.css)
              }
              this.innerHTML = Controller.template
              const controller = new Controller();
              (controller as any).getService = getService
              controller.element = this
              if (controller.onMount) {
                controller.onMount()
              }
            }
          })
        }
      }
      const packageTag = packageName.replaceAll('.', '-')
      if (type === 'app') {
        if (Views) {
          defineComponent(App)
          const keys = Object.keys(Views)
          for (const key of keys) {
            const Controller = Views[key]
            defineComponent(Controller)
          }
        }
        const tag = Views ? packageTag : App.tag || packageTag
        if (window.customElements.get(tag) === undefined) {
          window.customElements.define(tag, class extends WindowComponent implements IWindow {
            onMount = () => {
              this.innerHTML = Views ? `<ion-nav root="${App.tag}"></ion-nav>` : App.template || ''
              if (!Views) {
                if (App.css) {
                  this.shadowRoot.adoptedStyleSheets.push(App.css)
                }
                const controller = new App(args);
                (controller as any).getService = getService
                controller.element = this
                if (controller.onMount) {
                  controller.onMount()
                }
              }
            }
          })
        }
        element = document.createElement(tag)
        element.addEventListener('onClose', () => {
          const index = this[__PROGRAMS__].findIndex((task: ITask) => task.PID === PID)
          this[__PROGRAMS__].splice(index, 1)
        })
        element.slot = 'app'
        containerElement.append(element)
      }
      if (type === 'program') {
        console.error('Aún no hay soporte para programas!')
        return
      }
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