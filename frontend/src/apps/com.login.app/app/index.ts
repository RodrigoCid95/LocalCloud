import { AppArguments } from 'types'
import css from './style.scss'
import template from './template.html'

export default (kit: AppArguments) => {
  const { WindowComponent, services: [loginService] } = kit
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
        loginService.login()
      })
    }
    renderContent() {
      return template
    }
  }
  return LoginProgram
}