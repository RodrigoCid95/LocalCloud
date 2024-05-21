import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

import './item'

@customElement('apps-user')
export default class AppsUserElement extends LitElement implements HTMLAppsUserElement {
  @state() private apps: AppItem[] = []
  @state() private loading: boolean = false
  private modal = createRef<HTMLIonModalElement>()
  private user?: Users.User
  async setUser(user: Users.User): Promise<void> {
    await this.modal.value?.present()
    this.loading = true
    this.apps = []
    this.user = user
    const userApps = await window.connectors.apps.listByUID(user.uid)
    const appList = await window.connectors.apps.list()
    this.apps = appList.map(app => ({
      ...app,
      assign: userApps.findIndex(userApp => app.package_name === userApp.package_name) > -1
    }))
    this.loading = false
  }
  handlerOnDismiss() {
    this.user = undefined
    this.apps = []
  }
  render() {
    return html`
      <ion-modal ${ref(this.modal)} @ionModalWillDismiss=${this.handlerOnDismiss.bind(this)}>
        <ion-header>
          <ion-toolbar>
            <ion-title>Apps - ${this.user?.name}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss()}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
            ${this.loading ? html`<ion-progress-bar type="indeterminate"></ion-progress-bar>` : ''}
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <style>
            ion-note {
              display: block;
            }
          </style>
          <ion-list inset>
            ${this.apps.length === 0 ? html`
              <ion-item>
                <ion-label class="ion-text-center">No hay apps instaladas.</ion-label>
              </ion-item>
            ` : ''}
            ${this.apps.map(app => html`<apps-user-item .uid=${this.user?.uid} .app=${app} ?assign=${app.assign}></apps-user-item>`)}
          </ion-list>
        </ion-content>
      </ion-modal>
    `
  }
}

interface AppItem extends Apps.App {
  assign: boolean
}

declare global {
  interface HTMLAppsUserElement extends LitElement {
    setUser(user: Users.User): void
  }
  interface HTMLElementTagNameMap {
    'apps-user': HTMLAppsUserElement
  }
}
