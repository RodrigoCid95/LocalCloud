import { ProgramArguments, WindowComponent } from 'types'
import css from './style.scss'
import template from './template.html'

const __PROPERTIES__ = Symbol()
export default (kit: ProgramArguments) => {
  const { Program } = kit
  return class TaskbarProgram extends Program {
    apps = []
    constructor() {
      super()
      this.template = template
    }
    connectedCallback() {
      (window as any).taskbar = this
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.querySelector('button').addEventListener('click', () => this.dispatchEvent(new CustomEvent('onLaunchClick')))
    }
    public add(app: WindowComponent) {
      this.apps.push(app)
      app.style.zIndex = this.apps.length.toString()
      const buttonElement = document.createElement('button')
      buttonElement.innerHTML = app.text
      buttonElement.addEventListener('click', () => {
        if (app.minimize) {
          app.minimize = false
          app.focus()
        } else {
          const zIndex = parseInt(app.style.zIndex)
          if (zIndex === this.apps.length) {
            app.minimize = true
          } else {
            app.focus()
          }
        }
      })
      buttonElement.classList.add('active')
      this.shadowRoot.querySelector('.buttons').append(buttonElement)
      const orderIndexes = () => {
        for (let index = 0; index < this.apps.length; index++) {
          const appElement = this.apps[index]
          appElement.style.zIndex = (index + 1).toString()
        }
      }
      app.addEventListener('onClose', () => {
        buttonElement.remove()
        this.apps.splice(parseInt(app.style.zIndex) - 1, 1)
        orderIndexes()
      })
      app.addEventListener('focus', () => {
        buttonElement.classList.add('active')
        let appIndex = parseInt(app.style.zIndex)
        if (this.apps.length > 1 && appIndex < this.apps.length) {
          appIndex--
          for (let index = appIndex; index < this.apps.length; index++) {
            const nextElement = this.apps[(index + 1)]
            if (nextElement) {
              this.apps[index] = nextElement
            } else {
              this.apps[index] = app
            }
          }
          orderIndexes()
        }
      })
      app.addEventListener('blur', () => {
        buttonElement.classList.remove('active')
      })
    }
  }
}