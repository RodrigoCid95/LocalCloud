import { AppArguments } from 'types'
import css from './style.scss'
import template from './template.html'

export default (kit: AppArguments) => {
  const { WindowComponent } = kit
  return class AppTwoProgram extends WindowComponent {
    constructor() {
      super()
      this.text = 'Test Application Two'
      this.withBtnMinimize = true
      this.withBtnClose = true
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
    }
    renderContent() {
      return template
    }
  }
}