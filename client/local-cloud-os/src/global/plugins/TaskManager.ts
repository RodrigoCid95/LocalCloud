import { ITaskManager, ITask, ITasks, LaunchArguments, ManifestResult, IServiceTask, IService, AppResult, ClassController, IWindow, ServiceResults } from 'types/task-manager'
import { ICapacitor } from 'types/capacitor'
import { Build } from '@stencil/core'
import { WebPlugin } from '@capacitor/core'
import { Emmiters } from './EventEmmiters'

declare const Capacitor: ICapacitor

export class TaskManager extends WebPlugin implements ITaskManager {
  private _tasks: ITasks = []
  private eventEmmiters = new Emmiters()
  async getTasks(): Promise<ITasks> {
    return this._tasks
  }
  async onLaunch(callback: () => void): Promise<void> {
    await this.eventEmmiters.on('onTMLauncher', callback)
  }
  async onKill(callback: () => void): Promise<void> {
    await this.eventEmmiters.on('onTMKill', callback)
  }
  async onLaunchOrKill(callback: () => void): Promise<void> {
    await this.eventEmmiters.on('onTMLauncherOrKill', callback)
  }
  async launch({ packageName, containerElement, args }: LaunchArguments): Promise<ITask> {
    const manifest: ManifestResult = await Capacitor.Plugins.ServerConnector.emit<ManifestResult>(`apps manifest`, { packageName })
    if (!manifest) {
      throw new Error(`El paquete ${packageName} no existe!`)
    }
    const PID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
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
        const servicePath = `app/${packageName}/services/${key}.js`
        const serviceURL = `${Build.isDev ? 'http://localhost:3001' : location.origin}/${servicePath}`
        const { default: callback } = await import(serviceURL)
        const ClassService: any = await callback()
        let service: IService = new ClassService()
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
    let element: HTMLElement
    const kill = this.kill.bind(this)
    const task: ITask = {
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
    const { type } = manifest
    const componentPath = `app/${packageName}/main.js`
    const componentURL = `${Build.isDev ? 'http://localhost:3001' : location.origin}/${componentPath}`
    const { App, Views }: AppResult = await import(componentURL)
    const serviceResults: ServiceResults = {}
    for (const { name, service } of services) {
      serviceResults[name] = service
    }
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
            (Controller as any).prototype.getService = (nameService: string) => serviceResults[nameService]
            this.innerHTML = Controller.template
            const controller = new Controller()
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
              (App as any).prototype.getService = (nameService: string) => serviceResults[nameService]
              const controller = new App(args)
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
        const index = this._tasks.findIndex((task: ITask) => task.PID === PID)
        this._tasks.splice(index, 1)
      })
      element.slot = 'app'
      containerElement.append(element)
    }
    if (type === 'program') {
      throw new Error('Aún no hay soporte para programas!')
    }
    this._tasks.push(task)
    await this.eventEmmiters.emmit('onTMLauncher')
    await this.eventEmmiters.emmit('onTMLauncherOrKill')
    return task
  }
  async kill(PID: string): Promise<void> {
    const task: ITask | undefined = this._tasks.find(task => task.PID === PID)
    if (task) {
      for (const service of task.services) {
        if (service.onKill) {
          service.onKill()
        }
      }
      task.element.remove()
      await this.eventEmmiters.emmit('onTMKill')
      await this.eventEmmiters.emmit('onTMLauncherOrKill')
    }
  }
}
const __properties__ = Symbol()
class WindowComponent extends HTMLElement implements IWindow {
  [__properties__] = {
    icon: '',
    draggable: true,
    move: false,
    resize: true,
    minimize: false,
    position: {
      isDragging: false,
      currentX: 0,
      currentY: 0,
      initialX: 0,
      initialY: 0,
      xOffset: 0,
      yOffset: 0
    },
    isFocus: false,
    width: {
      value: 0,
      min: 0,
      max: 0
    },
    height: {
      value: 0,
      min: 0,
      max: 0
    },
    resizeObserver: undefined,
    btnClose: undefined,
    btnMinimize: undefined,
    autoFullScreen: true,
    callbackAutoFullScreen: undefined,
    matchMedia: window.matchMedia('(max-width: 452px)')
  }
  onMount?: () => void | Promise<void>
  public set icon(v: string) {
    this[__properties__].icon = v
  }
  public get icon(): string {
    return this[__properties__].icon
  }
  public set isDraggable(v: boolean) {
    this[__properties__].draggable = v
  }
  public get isDraggable(): boolean {
    return this[__properties__].draggable
  }
  public set isResize(v: boolean) {
    this[__properties__].resize = v
    if (this.isConnected) {
      this.style.resize = this[__properties__].resize ? 'both' : 'none'
    }
  }
  public get isResize(): boolean {
    return this[__properties__].resize
  }
  public set minimize(v: boolean) {
    this[__properties__].minimize = v
    if (this.isConnected) {
      this.style.display = v ? 'none' : 'block'
      if (v) {
        this.focus()
      } else {
        this.blur()
      }
    }
  }
  public get minimize(): boolean {
    return this[__properties__].minimize
  }
  public get isFocus(): boolean {
    return this[__properties__].isFocus
  }
  public set width(v: number) {
    this[__properties__].width.value = v
    if (this.isConnected && this[__properties__].width.value > 0) {
      this.style.width = `${v}px`
    }
  }
  public get width(): number {
    return (this[__properties__].width.value > 0) ? this[__properties__].width.value : this.offsetWidth
  }
  public set minWidth(v: number) {
    this[__properties__].width.min = v
    if (this.isConnected && this[__properties__].width.min > 0) {
      this.style.minWidth = `${v}px`
    }
  }
  public get minWidth(): number {
    return this[__properties__].width.min
  }
  public set maxWidth(v: number) {
    this[__properties__].width.max = v
    if (this.isConnected && this[__properties__].width.max > 0) {
      this.style.maxWidth = `${v}px`
    }
  }
  public get maxWidth(): number {
    return this[__properties__].width.max
  }
  public set height(v: number) {
    this[__properties__].height.value = v
    if (this.isConnected && this[__properties__].height.value > 0) {
      this.style.height = `${v}px`
    }
  }
  public get height(): number {
    return (this[__properties__].height.value > 0) ? this[__properties__].height.value : this.offsetHeight
  }
  public set minHeight(v: number) {
    this[__properties__].height.min = v
    if (this.isConnected && this[__properties__].height.min > 0) {
      this.style.minHeight = `${v}px`
    }
  }
  public get minHeight(): number {
    return this[__properties__].height.min
  }
  public set maxHeight(v: number) {
    this[__properties__].height.max = v
    if (this.isConnected && this[__properties__].height.max > 0) {
      this.style.maxHeight = `${v}px`
    }
  }
  public get maxHeight(): number {
    return this[__properties__].height.max
  }
  public set autoFullScreen(v: boolean) {
    this[__properties__].autoFullScreen = v
    if (this.isConnected) {
      if (v) {
        this[__properties__].matchMedia.addEventListener('change', this[__properties__].callbackAutoFullScreen)
      } else {
        this[__properties__].matchMedia.removeEventListener('change', this[__properties__].callbackAutoFullScreen)
      }
    }
  }
  public get autoFullScreen(): boolean {
    return this[__properties__].autoFullScreen
  }
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this[__properties__].callbackAutoFullScreen = ({ matches }) => {
      if (matches) {
        this.setAttribute('fullscreen', '')
      } else {
        this.removeAttribute('fullscreen')
      }
    }
  }
  async connectedCallback() {
    this.style.display = 'none'
    const style = new CSSStyleSheet()
    style.replaceSync(':host{position:absolute;outline:1px solid #222428;height:85%;width:500px;overflow:hidden}slot{display:flex;flex-direction:column;height:100%;overflow:auto}@media (max-width: 576px){:host([fullscreen]){width:100%!important;height:100%!important;top:0!important;left:0!important;resize:none!important;transform:unset!important}}')
    this.shadowRoot.adoptedStyleSheets.push(style)
    this.width = this.width
    this.minWidth = this.minWidth
    this.maxWidth = this.maxWidth
    this.height = this.height
    this.minHeight = this.minHeight
    this.maxHeight = this.maxHeight
    this.shadowRoot.innerHTML = '<slot></slot>'
    requestAnimationFrame(() => {
      if (this.isConnected) {
        const x = (this.parentElement.clientWidth - this.clientWidth) / 2
        const y = (this.parentElement.clientHeight - this.clientHeight) / 2
        this.style.left = `${x}px`
        this.style.top = `${y}px`
        this.icon = this.icon
        this.minimize = this.minimize
        this.isResize = this.isResize
      }
    })
    const toolbarElement = this.shadowRoot.querySelector('slot')
    const dragStart = (e: MouseEvent | TouchEvent) => {
      if (this[__properties__].draggable && this[__properties__].autoFullScreen && !this[__properties__].matchMedia.matches) {
        if (e instanceof MouseEvent) {
          this[__properties__].position.initialX = e.clientX - this[__properties__].position.xOffset
          this[__properties__].position.initialY = e.clientY - this[__properties__].position.yOffset
          toolbarElement.addEventListener('mousemove', drag)
        } else if (e instanceof TouchEvent) {
          this[__properties__].position.initialX = e.touches[0].clientX - this[__properties__].position.xOffset
          this[__properties__].position.initialY = e.touches[0].clientY - this[__properties__].position.yOffset
          toolbarElement.addEventListener('touchmove', drag)
        }
        this[__properties__].position.isDragging = true
      }
    }
    const drag = (e: MouseEvent | TouchEvent) => {
      if (this[__properties__].draggable && this[__properties__].position.isDragging) {
        e.preventDefault()
        if (e instanceof MouseEvent) {
          this[__properties__].position.currentX = e.clientX - this[__properties__].position.initialX
          this[__properties__].position.currentY = e.clientY - this[__properties__].position.initialY
        } else if (e instanceof TouchEvent) {
          this[__properties__].position.currentX = e.touches[0].clientX - this[__properties__].position.initialX
          this[__properties__].position.currentY = e.touches[0].clientY - this[__properties__].position.initialY
        }
        this[__properties__].position.xOffset = this[__properties__].position.currentX
        this[__properties__].position.yOffset = this[__properties__].position.currentY
        this.style.transform = `translate3d(${this[__properties__].position.currentX}px, ${this[__properties__].position.currentY}px, 0)`
      }
    }
    const dragEnd = (e: MouseEvent | TouchEvent) => {
      this[__properties__].position.initialX = this[__properties__].position.currentX
      this[__properties__].position.initialY = this[__properties__].position.currentY
      if (e instanceof MouseEvent) {
        toolbarElement.removeEventListener('mousemove', drag)
      } else if (e instanceof TouchEvent) {
        toolbarElement.removeEventListener('touchmove', drag)
      }
      this[__properties__].position.isDragging
    }
    toolbarElement.addEventListener('mousedown', dragStart)
    toolbarElement.addEventListener('touchstart', dragStart)
    toolbarElement.addEventListener('mouseup', dragEnd)
    toolbarElement.addEventListener('touchend', dragEnd)
    this.tabIndex = 0
    this.focus()
    this.addEventListener('focus', () => this[__properties__].isFocus = true)
    this.addEventListener('blur', () => this[__properties__].isFocus = false)
    this[__properties__].resizeObserver = new ResizeObserver(([{ borderBoxSize: [{ blockSize, inlineSize }] }]) => {
      this[__properties__].width.value = inlineSize
      this[__properties__].height.value = blockSize
      this.dispatchEvent(new CustomEvent('onResize'))
    })
    this[__properties__].resizeObserver.observe(this)
    this.autoFullScreen = this.autoFullScreen
    requestAnimationFrame(() => {
      if (this[__properties__].matchMedia.matches && this.autoFullScreen) {
        this.setAttribute('fullscreen', '')
      }
    })
    if (this.onMount) {
      await this.onMount()
    }
    this.style.display = 'block'
  }
  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('onClose'))
    this[__properties__]?.resizeObserver?.unobserve(this)
  }
}