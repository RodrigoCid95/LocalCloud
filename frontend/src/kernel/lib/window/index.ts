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
      x: 0,
      y: 0
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
    resizeObserver: null
  }
  public set text(v: string) {
    this[__properties__].text = v
    const textElement = this.shadowRoot.querySelector('.toolbar .title span')
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
    toolbarElement.addEventListener('mousedown', (e: MouseEvent) => {
      if (this[__properties__].draggable) {
        this[__properties__].move = true
        this[__properties__].position.x = e.clientX
        this[__properties__].position.y = e.clientY
      }
    })
    toolbarElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this[__properties__].move) return;
      requestAnimationFrame(() => {
        const deltaX = e.clientX - this[__properties__].position.x
        const deltaY = e.clientY - this[__properties__].position.y
        this.style.left = `${this.offsetLeft + deltaX}px`
        this.style.top = `${this.offsetTop + deltaY}px`
        this[__properties__].position.x = e.clientX
        this[__properties__].position.y = e.clientY
      })
    })
    toolbarElement.addEventListener('mouseup', () => this[__properties__].move = false)
    const buttonsElement = toolbarElement.querySelector('.buttons')
    buttonsElement.querySelector('.minimize').addEventListener('click', () => this.minimize = true)
    buttonsElement.querySelector('.close').addEventListener('click', () => {
      this.remove()
    })
    this.style.display = 'flex'
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
  }
  disconnectedCallback() {
    this[__properties__]?.resizeObserver?.unobserve(this)
  }
}