import { ProgramArguments } from 'types'
import css from './style.scss'
import template from './template.html'
import appLogo from './app.webp'
import { LauncherService } from '../types'

export default (kit: ProgramArguments) => {
  const { Program, getService } = kit
  const launcherService = getService<LauncherService>('launcher.service')
  const __properties__ = Symbol()
  return class LauncherProgram extends Program {
    [__properties__] = {
      appsList: [],
      renderItems: undefined
    }
    constructor() {
      super()
      this.template = template
      this[__properties__].renderItems = (items = this[__properties__].appsList) => {
        const appListElement = this.shadowRoot.querySelector('.appList')
        const searchElement: HTMLInputElement = this.shadowRoot.getElementById('search') as HTMLInputElement
        appListElement.innerHTML = ''
        const resultElements = items.map(({ packageName, title, icon }) => {
          const itemElement = document.createElement('div')
          itemElement.classList.add('item')
          itemElement.innerHTML = `<div class="icon"><img src="${icon || appLogo}" alt="${packageName}"></div><div class="content"><label>${title}</label></div>`
          itemElement.addEventListener('click', async () => {
            this.toggleAttribute('open')
            searchElement.value = ''
            this.dispatchEvent(new CustomEvent('onLaunchProgram', { detail: packageName }))
            this[__properties__].renderItems()
          })
          return itemElement
        })
        for (const item of resultElements) {
          appListElement.append(item)
        }
      }
      launcherService.getAppList().then(manifests => {
        this[__properties__].appsList = manifests
        this[__properties__].renderItems()
      })
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      const searchElement: HTMLInputElement = this.shadowRoot.getElementById('search') as HTMLInputElement
      searchElement.addEventListener('keyup', () => requestAnimationFrame(() => {
        const term = searchElement.value.toLocaleLowerCase()
        const results = term === '' ? this[__properties__].appsList : this[__properties__].appsList.filter(item => item.title.toLocaleLowerCase().includes(term))
        this[__properties__].renderItems(results)
      }))
      this.shadowRoot.querySelector('.btnClose').addEventListener('click', () => this.removeAttribute('open'))
      window.addEventListener('keydown', ({key}) => {
        if (key === 'Escape') {
          this.removeAttribute('open')
        }
      })
    }
  }
}