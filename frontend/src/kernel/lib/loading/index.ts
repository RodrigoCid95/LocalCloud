import Program from '../Program'
import css from './style.scss'
import template from './template.html'

customElements.define('app-loading', class LoadingComponent extends Program {
  constructor() {
    super()
    this.template = template
  }
  connectedCallback() {
    super.connectedCallback()
    this.shadowRoot.adoptedStyleSheets.push(css)
  }
})