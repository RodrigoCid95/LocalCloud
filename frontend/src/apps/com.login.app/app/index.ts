import { KIT } from 'types'
import css from './style.scss'
import template from './template.html'

export const Main = (kit: KIT) => {
  const { WindowComponent, server, manifest } = kit
  class LoginProgram extends WindowComponent {
    constructor() {
      super()
      this.text = 'Iniciar sesión'
      this.isDraggable = true
      this.isResize = true
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
        server.socket.emit('login/sigin', true)
      })
    }
    renderContent() {
      return template
    }
  }
  if (customElements.get(manifest.tag) === undefined) {
    customElements.define(manifest.tag, LoginProgram)
  }
}