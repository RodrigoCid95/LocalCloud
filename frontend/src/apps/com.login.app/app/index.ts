import { ProgramArguments } from 'types'
import { LoginService } from '../types'
import css from './style.scss'
import template from './template.html'

export default (kit: ProgramArguments) => {
  const { WindowComponent, getService } = kit
  const loginService = getService<LoginService>('login.service')
  class LoginProgram extends WindowComponent {
    constructor() {
      super()
      this.text = 'Iniciar sesión'
      this.isDraggable = false
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.querySelector('button').addEventListener('click', loginService.login.bind(loginService))
    }
    renderContent() {
      return template
    }
  }
  return LoginProgram
}