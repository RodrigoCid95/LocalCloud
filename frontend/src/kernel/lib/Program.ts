const __properties__ = Symbol()
export default class Program extends HTMLElement {
  [__properties__] = {
    template: ''
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
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  connectedCallback() {
    this.template = this.template
  }
  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('onClose'))
  }
}