import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'

import './components/item'

const NAME_DIRECTORIES: any = {
  shared: 'Carpeta compartida',
  user: 'Carpeta personal'
}

@customElement('page-recycle-bin')
export class RecycleBinPage extends LitElement implements HTMLPageRecycleBinElement {
  @state() private itemsList: RecycleBinItem[] = []
  @state() private loading: boolean = true
  async add(path: string[]): Promise<void> {
    await window.server.send({
      endpoint: 'recycle-bin',
      method: 'post',
      data: JSON.stringify({
        path
      })
    })
    await this.loadItems()
  }
  constructor() {
    super()
    this.loadItems()
  }
  async loadItems() {
    this.loading = true
    this.itemsList = (await window.server.send<RecycleBinItem[]>({
      endpoint: 'recycle-bin',
      method: 'get'
    })).map(item => {
      item.path[0] = NAME_DIRECTORIES[item.path[0]] || item.path[0]
      return item
    })
    this.loading = false
  }
  async clean() {
    this.loading = true
    const items = this.querySelectorAll('recycle-bin-item')
    for (let index = 0; index < items.length; index++) {
      const item = items.item(index)
      await item.delete(true)
    }
    this.loading = false
    this.itemsList = []
  }
  render() {
    return html`
      <style>
        .rb-alert .alert-message {
          text-wrap: balance;
        }
      </style>
      <ion-header>
        <ion-toolbar>
          <ion-title>Papelera de reciclaje</ion-title>
          ${this.itemsList.length === 0 ? '' : html`
            <ion-buttons slot="end">
              <ion-button button @click=${this.clean.bind(this)}>
                <ion-icon slot="icon-only" name="trash-bin-outline"></ion-icon>
              </ion-button>
            </ion-buttons>
          `}
        </ion-toolbar>
        ${this.loading ? html`<ion-progress-bar type="indeterminate"></ion-progress-bar>` : ''}
      </ion-header>
      <ion-content>
        <ion-list inset>
          ${this.itemsList.length > 0 ? '' : html`
            <ion-item>
              <ion-label class="ion-text-center">No hay archivos.</ion-label>
            </ion-item>
          `}
          ${this.itemsList.map(item => html`
            <recycle-bin-item
              .item=${item}
              @remove=${this.loadItems.bind(this)}
            ></recycle-bin-item>
          `)}
        </ion-list>
      </ion-content>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLPageRecycleBinElement extends LitElement {
    add(path: string[]): Promise<void>
  }
  interface HTMLElementTagNameMap {
    'page-recycle-bin': HTMLPageRecycleBinElement
  }
}