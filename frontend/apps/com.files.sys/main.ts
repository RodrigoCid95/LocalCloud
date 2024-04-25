import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { createRef, ref } from 'lit/directives/ref.js'

import './pages'

@customElement('app-root')
export default class AppRoot extends LitElement {
  private filesPage = createRef()
  private swapPage = createRef()
  private sharedPage = createRef()
  private recycleBinPage = createRef()
  render() {
    return html`
      <ion-tabs>
        <ion-tab tab="files">
          <page-files ${ref(this.filesPage)}></page-files>
          <ion-nav ${ref((e: any) => e.root = this.filesPage.value)}></ion-nav>
        </ion-tab>
        <ion-tab tab="swap">
          <page-swaps ${ref(this.swapPage)}></page-swaps>
          <ion-nav ${ref((e: any) => e.root = this.swapPage.value)}></ion-nav>
        </ion-tab>
        <ion-tab tab="shared">
          <page-shared ${ref(this.sharedPage)}></page-shared>
          <ion-nav ${ref((e: any) => e.root = this.sharedPage.value)}></ion-nav>
        </ion-tab>
        <ion-tab tab="recycle-bin">
          <page-recycle-bin ${ref(this.recycleBinPage)}></page-recycle-bin>
          <ion-nav ${ref((e: any) => e.root = this.recycleBinPage.value)}></ion-nav>
        </ion-tab>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="files">
            <ion-icon name="home-outline"></ion-icon>
          </ion-tab-button>
          <ion-tab-button tab="swap">
            <ion-icon name="swap-vertical-outline"></ion-icon>
          </ion-tab-button>
          <ion-tab-button tab="shared">
            <ion-icon name="share-outline"></ion-icon>
          </ion-tab-button>
          <ion-tab-button tab="recycle-bin">
            <ion-icon name="file-tray-outline"></ion-icon>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    `
  }
  createRenderRoot = () => this
}

document.addEventListener("onReady", () => document.body.innerHTML = '<app-root></app-root>')