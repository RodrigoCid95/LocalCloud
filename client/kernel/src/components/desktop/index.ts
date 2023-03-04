import { IonModal } from "@ionic/core/components/ion-modal"
import { IServer, IWindow, ManifestResult } from "builder"
import OS from "OS"
import css from './style.scss'
import template from './template.html'
import shadow from './shadow.html'
import iconApp from './app.svg'

export default async (server: IServer, launch: OS['launch']) => {
  window.customElements.define('app-desktop', class AppDesktop extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
    }
    async connectedCallback() {
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.innerHTML = shadow
      this.innerHTML = template
      const modalLauncher: IonModal = this.querySelector('#launcher')
      const manifestResults: ManifestResult[] = (await server.emit<ManifestResult[]>('apps manifests', {})) || []
      const modalLauncherContent = modalLauncher.querySelector('ion-content')
      modalLauncherContent.innerHTML = ''
      const orderIndexes = (start: number) => {
        const apps = this.querySelectorAll<IWindow>('[slot="app"]')
        apps.forEach(app => {
          let zIndex = parseInt(app.style.zIndex)
          if (zIndex > start) {
            zIndex--
            app.tabIndex = zIndex
            app.style.zIndex = zIndex.toString()
          }
        })
      }
      console.log(manifestResults)
      for (const manifest of manifestResults) {
        const item = document.createElement('ion-item')
        item.innerHTML = `<ion-thumbnail slot="start"><img alt="${manifest.packageName}" src="${manifest.icon}" /></ion-thumbnail><ion-label>${manifest.title}</ion-label>`
        item.style.cursor = 'pointer'
        item.addEventListener('click', async () => {
          modalLauncher.dismiss()
          const { icon, name, title, kill, element } = await launch({ packageName: manifest.packageName, containerElement: this })
          if (element instanceof HTMLElement) {
            (element as IWindow).tabIndex = this.querySelectorAll('[slot="app"]').length;
            (element as IWindow).style.zIndex = (element as IWindow).tabIndex.toString()
            const btnTask = document.createElement('ion-chip')
            btnTask.innerHTML = `<ion-avatar><img alt="${name}" src="${icon || iconApp}" /></ion-avatar><ion-label>${title}</ion-label><ion-icon name="close-circle"></ion-icon>`
            element.addEventListener('onClose', () => {
              btnTask.remove()
              orderIndexes((element.tabIndex + 1))
            });
            (element as IWindow).addEventListener('focus', () => {
              btnTask.setAttribute('color', 'primary')
              let appIndex = parseInt((element as IWindow).style.zIndex)
              const apps = this.querySelectorAll('[slot="app"]')
              if (apps.length > 1 && appIndex < apps.length) {
                orderIndexes(appIndex);
                (element as IWindow).tabIndex = apps.length;
                (element as IWindow).style.zIndex = apps.length.toString()
              }
            });
            (element as IWindow).addEventListener('blur', () => btnTask.removeAttribute('color'))
            btnTask.querySelector('ion-icon').addEventListener('click', kill)
            btnTask.addEventListener('click', () => {
              if ((element as IWindow).minimize) {
                (element as IWindow).minimize = false;
                (element as IWindow).focus()
              } else {
                const zIndex = parseInt((element as IWindow).style.zIndex)
                if (zIndex === this.querySelectorAll('[slot="app"]').length) {
                  (element as IWindow).minimize = true
                } else {
                  (element as IWindow).focus()
                }
              }
            })
            this.querySelector('.tasks').append(btnTask)
          }
        })
        modalLauncherContent.append(item)
      }
      this.dispatchEvent(new CustomEvent('onReady', {}))
      this.querySelector('[name="play"]').addEventListener('click', () => modalLauncher.present())
    }
  })
}