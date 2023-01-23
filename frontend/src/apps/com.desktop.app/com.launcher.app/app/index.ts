import { KIT } from 'types'
import css from './style.scss'
import template from './template.html'
import appLogo from './app.webp'

export const Main = (kit: KIT) => {
  const { Program, server, manifest } = kit
  const __properties__ = Symbol()
  class LauncherProgram extends Program {
    [__properties__] = {
      appsList: []
    }
    constructor() {
      super()
      this.template = template
      server.socket.emit('apps', ({ data }) => this[__properties__].appsList = data)
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      const searchElement: HTMLInputElement = this.shadowRoot.getElementById('search') as HTMLInputElement
      searchElement.addEventListener('keyup', () => requestAnimationFrame(() => {
        const appListElement = this.shadowRoot.querySelector('.appList')
        appListElement.innerHTML = ''
        const results = this[__properties__].appsList.filter(item => item.title.toLocaleLowerCase().includes(searchElement.value.toLocaleLowerCase()))
        const resultElements = results.map(({ packageNane, title, icon }) => {
          const itemElement = document.createElement('div')
          itemElement.classList.add('item')
          itemElement.innerHTML = `<div class="icon"><img src="${icon || appLogo}" alt="${packageNane}"></div><div class="content"><div class="label">${title}</div></div>`
          itemElement.addEventListener('click', async () => {
            this.toggleAttribute('open')
            appListElement.innerHTML = ''
            searchElement.value = ''
            this.dispatchEvent(new CustomEvent('onLaunchProgram', { detail: packageNane }))
          })
          return itemElement
        })
        for (const item of resultElements) {
          appListElement.append(item)
        }
      }))
    }
  }
  if (customElements.get(manifest.tag) === undefined) {
    customElements.define(manifest.tag, LauncherProgram)
  }
}