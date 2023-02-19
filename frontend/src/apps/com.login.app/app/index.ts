import { ProgramArguments } from 'types'
import { LoginService, Credential } from '../types'
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
      this.shadowRoot.querySelector('form').addEventListener('submit', e => {
        e.preventDefault()
        const credential: Credential = {
          name: (this.shadowRoot.getElementById('name') as HTMLInputElement).value || '',
          password: (this.shadowRoot.getElementById('pass') as HTMLInputElement).value || ''
        }
        loginService.login.bind(loginService)(credential)
      })
    }
    renderContent() {
      return template
    }
  }
  return LoginProgram
}