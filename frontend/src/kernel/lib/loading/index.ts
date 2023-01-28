import css from './style.scss'
import template from './template.html'

customElements.define('app-loading', class LoadingComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  connectedCallback() {
    this.shadowRoot.adoptedStyleSheets.push(css)
    this.shadowRoot.innerHTML = template
  }
})