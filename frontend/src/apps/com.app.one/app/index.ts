import { AppArguments } from 'types'
import css from './style.scss'
import template from './template.html'

export default (kit: AppArguments) => {
  const { WindowComponent } = kit
  return class AppOneProgram extends WindowComponent {
    constructor() {
      super()
      this.text = 'Test Application One'
      this.isResize = true
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