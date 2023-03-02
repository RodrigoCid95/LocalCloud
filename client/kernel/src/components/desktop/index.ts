import { IServer, ITask } from "builder"
import css from './style.scss'
import template from './template.html'

export default async (server: IServer) => {
  window.customElements.define('app-desktop', class AppDesktop extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.innerHTML = template
    }
  })
}