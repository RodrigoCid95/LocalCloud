import { AppArguments } from 'builder'
import css from './style.scss'
import template from './template.html'

export default (kit: AppArguments) => {
  const { WindowComponent } = kit
  return class AppOneProgram extends WindowComponent {
    constructor() {
      super()
      this.isResize = true
    }
    onMount() {
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.innerHTML = template
      this.querySelector('[name="minimize"]').addEventListener('click', () => this.minimize = true)
      this.querySelector('[name="close"]').addEventListener('click', () => this.remove())
    }
  }
}