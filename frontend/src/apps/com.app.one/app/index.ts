import { KIT } from 'types'
import css from './style.scss'
import template from './template.html'

export const Main = (kit: KIT) => {
  const { WindowComponent, manifest } = kit
  class AppOneProgram extends WindowComponent {
    constructor() {
      super()
      this.text = 'Test Application One'
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
    }
    renderContent() {
      return template
    }
  }
  if (customElements.get(manifest.tag) === undefined) {
    customElements.define(manifest.tag, AppOneProgram)
  }
}