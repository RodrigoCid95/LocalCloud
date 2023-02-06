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
      appsList: []
    }
    constructor() {
      super()
      this.template = template
      launcherService.getAppList().then(manifests => {
        this[__properties__].appsList = []
        for (const key in manifests) {
          if (Object.prototype.hasOwnProperty.call(manifests, key)) {
            const manifest = manifests[key]
            this[__properties__].appsList.push({
              packageName: key,
              ...manifest
            })
          }
        }
      })
    }
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      const searchElement: HTMLInputElement = this.shadowRoot.getElementById('search') as HTMLInputElement
      searchElement.addEventListener('keyup', () => requestAnimationFrame(() => {
        const appListElement = this.shadowRoot.querySelector('.appList')
        appListElement.innerHTML = ''
        const term = searchElement.value.toLocaleLowerCase()
        const results = term === '' ? [] : this[__properties__].appsList.filter(item => item.title.toLocaleLowerCase().includes(term))
        const resultElements = results.map(({ packageName, title, icon }) => {
          const itemElement = document.createElement('div')
          itemElement.classList.add('item')
          itemElement.innerHTML = `<div class="icon"><img src="${icon || appLogo}" alt="${packageName}"></div><div class="content"><label>${title}</label></div>`
          itemElement.addEventListener('click', async () => {
            this.toggleAttribute('open')
            appListElement.innerHTML = ''
            searchElement.value = ''
            this.dispatchEvent(new CustomEvent('onLaunchProgram', { detail: packageName }))
          })
          return itemElement
        })
        for (const item of resultElements) {
          appListElement.append(item)
        }
      }))
    }
  }
}