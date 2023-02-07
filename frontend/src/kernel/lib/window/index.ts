import Program from '../Program'
import css from './style.scss'
import template from './template.html'

const __properties__ = Symbol()
export default class WindowComponent extends Program {
  [__properties__] = {
    text: '',
    icon: '',
    draggable: true,
    move: false,
    resize: false,
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
    template,
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
  public set text(v: string) {
    this[__properties__].text = v
    const textElement = this.shadowRoot.querySelector('.toolbar .title')
    if (textElement) {
      textElement.innerHTML = this[__properties__].text
    }
  }
  public get text(): string {
    return this[__properties__].text
  }
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
      this.style.display = v ? 'none' : 'flex'
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
  public set template(v: string) {
    this[__properties__].template = v
    if (this.isConnected) {
      this.shadowRoot.innerHTML = v
    }
  }
  public get template(): string {
    return this[__properties__].template
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
  public set withBtnMinimize(v: boolean) {
    if (v) {
      this[__properties__].btnMinimize = document.createElement('div')
      this[__properties__].btnMinimize.classList.add('minimize')
      this[__properties__].btnMinimize.addEventListener('click', () => this.minimize = true)
      if (this.isConnected) {
        this.shadowRoot.querySelector('.toolbar .buttons section:nth-child(1)').append(this[__properties__].btnMinimize)
      }
    } else {
      if (this[__properties__].btnMinimize) {
        if (this.isConnected) {
          this[__properties__].btnMinimize.remove()
        }
        delete this[__properties__].btnMinimize
      }
    }
  }
  public get withBtnMinimize(): boolean {
    return this[__properties__].btnMinimize !== undefined
  }
  public set withBtnClose(v: boolean) {
    if (v) {
      this[__properties__].btnClose = document.createElement('div')
      this[__properties__].btnClose.classList.add('close')
      this[__properties__].btnClose.addEventListener('click', () => this.remove())
      if (this.isConnected) {
        this.shadowRoot.querySelector('.toolbar .buttons section:nth-child(2)').append(this[__properties__].btnClose)
      }
    } else {
      if (this[__properties__].btnClose) {
        if (this.isConnected) {
          this[__properties__].btnClose.remove()
        }
        delete this[__properties__].btnClose
      }
    }
  }
  public get withBtnClose(): boolean {
    return this[__properties__].btnClose !== undefined
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
    this[__properties__].callbackAutoFullScreen = ({ matches }) => {
      if (matches) {
        this.setAttribute('fullscreen', '')
      } else {
        this.removeAttribute('fullscreen')
      }
    }
  }
  connectedCallback() {
    super.connectedCallback()
    this.style.display = 'none'
    this.shadowRoot.adoptedStyleSheets.push(css)
    this.width = this.width
    this.minWidth = this.minWidth
    this.maxWidth = this.maxWidth
    this.height = this.height
    this.minHeight = this.minHeight
    this.maxHeight = this.maxHeight
    const _this: any = this
    _this.shadowRoot.innerHTML = template
    if (_this.renderContent) {
      this.shadowRoot.querySelector('.content').innerHTML = _this.renderContent()
    }
    requestAnimationFrame(() => {
      if (this.isConnected) {
        const x = (this.parentElement.clientWidth - this.clientWidth) / 2
        const y = (this.parentElement.clientHeight - this.clientHeight) / 2
        this.style.left = `${x}px`
        this.style.top = `${y}px`
        this.text = this.text
        this.icon = this.icon
        this.minimize = this.minimize
        this.isResize = this.isResize
      }
    })
    const toolbarElement = this.shadowRoot.querySelector('.toolbar')
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
    this.withBtnMinimize = this.withBtnMinimize
    this.withBtnClose = this.withBtnClose
    this.autoFullScreen = this.autoFullScreen
    requestAnimationFrame(() => {
      if (this[__properties__].matchMedia.matches && this.autoFullScreen) {
        this.setAttribute('fullscreen', '')
      }
    })
    this.style.display = 'flex'
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    this[__properties__]?.resizeObserver?.unobserve(this)
  }
}