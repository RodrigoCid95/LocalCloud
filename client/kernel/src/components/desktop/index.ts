import { IonModal } from "@ionic/core/components/ion-modal"
import { IServer, ManifestResult } from "builder"
import OS from "OS"
import css from './style.scss'
import template from './template.html'

export default async (server: IServer, launch: OS['launch']) => {
  window.customElements.define('app-desktop', class AppDesktop extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
    }
    async connectedCallback() {
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.innerHTML = template
      const modalLauncher: IonModal = this.querySelector('ion-modal')
      const manifestResults: ManifestResult[] = (await server.emit<ManifestResult[]>('apps-manager user/manifests', {})) || []
      const modalLauncherContent = modalLauncher.querySelector('ion-content')
      modalLauncherContent.innerHTML = ''
      for (const manifest of manifestResults) {
        const item = document.createElement('ion-item')
        item.innerHTML = `<ion-thumbnail slot="start"><img alt="${manifest.packageName}" src="${manifest.icon}" /></ion-thumbnail><ion-label>${manifest.title}</ion-label>`
        item.style.cursor = 'pointer'
        item.addEventListener('click', () => {
          modalLauncher.dismiss()
          launch({ packageName: manifest.packageName, containerElement: this })
        })
        modalLauncherContent.append(item)
      }
      this.dispatchEvent(new CustomEvent('onReady', {}))
      modalLauncher.present()
    }
  })
}