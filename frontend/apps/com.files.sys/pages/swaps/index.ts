import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

import './components/item'

@customElement('page-swaps')
export default class PageSwaps extends LitElement implements HTMLPageSwapsElement {
  @state() private counter: number = 0
  private listRef = createRef<HTMLIonListElement>()
  addItem(path: string[], file?: File) {
    setTimeout(() => (document.querySelector('ion-tabs') as HTMLIonTabsElement).select('swap'), 500)
    setTimeout(() => {
      const item = document.createElement('swap-item')
      item.path = path
      if (file) {
        item.file = file
      }
      item.addEventListener('remove', () => this.counter--)
      this.listRef.value?.append(item)
      this.counter++
    }, 750)
  }
  clean() {
    let count = 0
    this.querySelectorAll('swap-item').forEach(item => {
      if (item.finished) {
        count++
        item.remove()
      }
    })
    this.counter -= count
  }
  render() {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-title>Transferencias</ion-title>
          ${this.counter === 0 ? '' : html`
            <ion-buttons slot="end">
              <ion-buttons slot="end">
                <ion-button button @click=${this.clean.bind(this)}>
                  <ion-icon slot="icon-only" name="trash-bin-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-buttons>
          `}
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list ${ref(this.listRef)} inset>
          ${this.counter > 0 ? '' : html`
            <ion-item>
              <ion-label class="ion-text-center">No hay Transferencias.</ion-label>
            </ion-item>
          `}
        </ion-list>
      </ion-content>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLPageSwapsElement extends LitElement {
    addItem(path: string[], file?: File): void
  }
  interface HTMLElementTagNameMap {
    'page-swaps': HTMLPageSwapsElement
  }
}