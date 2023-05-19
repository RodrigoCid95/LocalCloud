import _style from './style.scss'
import template from './template.html'

customElements.define('os-splash-screen', class SplashScreenComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    if (this.shadowRoot) {
      this.shadowRoot.adoptedStyleSheets.push(_style)
      this.shadowRoot.innerHTML = template
    }
  }
})