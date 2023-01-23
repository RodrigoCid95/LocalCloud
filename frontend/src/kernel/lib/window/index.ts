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
    }
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
    }
  }
  public get minimize(): boolean {
    return this[__properties__].minimize
  }
  connectedCallback() {
    this.style.display = 'none'
    this.shadowRoot.adoptedStyleSheets.push(css)
    const _this: any = this
    _this.shadowRoot.innerHTML = template
    if (_this.renderContent) {
      this.shadowRoot.querySelector('.content').innerHTML = _this.renderContent()
    }
    requestAnimationFrame(() => {
      const x = (this.parentElement.clientWidth - this.clientWidth) / 2
      const y = (this.parentElement.clientHeight - this.clientHeight) / 2
      this.style.left = `${x}px`
      this.style.top = `${y}px`
      this.text = this.text
      this.icon = this.icon
      this.minimize = this.minimize
      this.isResize = this.isResize
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
      this.dispatchEvent(new CustomEvent('onClose'))
      this.remove()
    })
    this.style.display = 'flex'
  }
}