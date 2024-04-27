import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'

import './components/item'

@customElement('page-shared')
export default class PageShared extends LitElement implements HTMLPageSharedElement {
  @state() sharedList: Shared.Shared[] = []
  constructor() {
    super()
    this.loadItems()
  }
  async addItem(path: string[]) {
    const toast = await window.toastController.create({ message: 'Compartiendo ...', buttons: ['Aceptar'] })
    await toast.present()
    const result = await window.connectors.shared.create(path)
    toast.message = 'Compartido!'
    toast.duration = 1500
    if (!toast.isOpen) {
      await toast.present()
    }
    if ('clipboard' in navigator) {
      const url = window.createURL({ path: ['shared', result.id] }).href
      if (document.hasFocus()) {
        navigator.clipboard.writeText(url)
      }
    }
    this.loadItems()
  }
  async loadItems() {
    this.sharedList = await window.connectors.shared.list()
  }
  render() {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-title>Archivos compartidos</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list inset>
          ${this.sharedList.length > 0 ? '' : html`
            <ion-item>
              <ion-label class="ion-text-center">No hay archivos compartidos.</ion-label>
            </ion-item>
          `}
          ${this.sharedList.map(item => html`<shared-item .shared=${item} @delete=${this.loadItems.bind(this)}></shared-item>`)}
        </ion-list>
      </ion-content>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLPageSharedElement extends LitElement {
    addItem(path: string[]): void
  }
  interface HTMLElementTagNameMap {
    'page-shared': HTMLPageSharedElement
  }
}