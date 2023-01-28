import { ProgramArguments, WindowComponent } from 'types'
import css from './style.scss'
import template from './template.html'

export default (kit: ProgramArguments) => {
  const { Program } = kit
  return class TaskbarProgram extends Program {
    constructor() {
      super()
      this.template = template
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.querySelector('button').addEventListener('click', () => this.dispatchEvent(new CustomEvent('onLaunchClick')))
    }
    public add(item: WindowComponent) {
      const buttonElement = document.createElement('button')
      buttonElement.innerHTML = item.text
      buttonElement.addEventListener('click', () => {
        item.minimize = !item.minimize
      })
      this.append(buttonElement)
      item.addEventListener('onClose', () => buttonElement.remove())
    }
  }
}