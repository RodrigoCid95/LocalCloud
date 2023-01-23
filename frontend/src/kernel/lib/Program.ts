const __properties__ = Symbol()
export default class Program extends HTMLElement {
  [__properties__] = {
    template: ''
  }
  protected set template(v: string) {
    this[__properties__].template = v
    if (this.isConnected) {
      this.shadowRoot.innerHTML = v
    }
  }
  protected get template(): string {
    return this[__properties__].template
  }
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  connectedCallback() {
    this.template = this.template
  }
}