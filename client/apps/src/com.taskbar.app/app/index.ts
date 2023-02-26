import { ProgramArguments, WindowComponent } from 'types'
import css from './style.scss'
import template from './template.html'
import appImage from './app.svg'

const __PROPERTIES__ = Symbol()
export default (kit: ProgramArguments) => {
  const { Program } = kit
  return class TaskbarProgram extends Program {
    [__PROPERTIES__] = {
      apps: []
    }
    constructor() {
      super()
      this.template = template
    }
    connectedCallback() {
      (window as any).taskbar = this
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.querySelector('.btnLaunch').addEventListener('click', () => this.dispatchEvent(new CustomEvent('onLaunchClick')))
    }
    public add(app: WindowComponent) {
      this[__PROPERTIES__].apps.push(app)
      app.style.zIndex = this[__PROPERTIES__].apps.length.toString()
      const buttonElement = document.createElement('div')
      buttonElement.classList.add('item')
      buttonElement.innerHTML = `${app.icon ? `<img src="${app.icon}" alt="${app.text}">` : appImage}<label>${app.text}</label>`
      buttonElement.addEventListener('click', () => {
        if (app.minimize) {
          app.minimize = false
          app.focus()
        } else {
          const zIndex = parseInt(app.style.zIndex)
          if (zIndex === this[__PROPERTIES__].apps.length) {
            app.minimize = true
          } else {
            app.focus()
          }
        }
      })
      buttonElement.classList.add('active')
      this.shadowRoot.querySelector('.buttons').append(buttonElement)
      const orderIndexes = () => {
        for (let index = 0; index < this[__PROPERTIES__].apps.length; index++) {
          const appElement = this[__PROPERTIES__].apps[index]
          appElement.style.zIndex = (index + 1).toString()
        }
      }
      app.addEventListener('onClose', () => {
        buttonElement.remove()
        this[__PROPERTIES__].apps.splice(parseInt(app.style.zIndex) - 1, 1)
        orderIndexes()
      })
      app.addEventListener('focus', () => {
        buttonElement.classList.add('active')
        let appIndex = parseInt(app.style.zIndex)
        if (this[__PROPERTIES__].apps.length > 1 && appIndex < this[__PROPERTIES__].apps.length) {
          appIndex--
          for (let index = appIndex; index < this[__PROPERTIES__].apps.length; index++) {
            const nextElement = this[__PROPERTIES__].apps[(index + 1)]
            if (nextElement) {
              this[__PROPERTIES__].apps[index] = nextElement
            } else {
              this[__PROPERTIES__].apps[index] = app
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