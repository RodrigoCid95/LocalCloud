import { AppArguments } from 'types'
import css from './style.scss'
import template from './template.html'

export default (kit: AppArguments) => {
  const { WindowComponent, services: [loginService] } = kit
  console.log(loginService)
  class LoginProgram extends WindowComponent {
    constructor() {
      super()
      this.text = 'Iniciar sesión'
      this.isDraggable = false
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.querySelector('button').addEventListener('click', () => {
        // server.socket.emit('login/sigin', true)
      })
    }
    renderContent() {
      return template
    }
  }
  return LoginProgram
}