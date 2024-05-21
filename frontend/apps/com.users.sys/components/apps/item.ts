import type { ToggleCustomEvent } from '@ionic/core'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'

@customElement('apps-user-item')
export class AppsUserItemElement extends LitElement implements HTMLAppsUserItemElement {
  @property({ type: Number }) uid: Users.User['uid']
  @property({ type: Object }) app: Apps.App
  @state() loading: boolean = false
  @property({ type: Boolean }) assign: boolean
  async handlerOnChange(e: ToggleCustomEvent) {
    this.loading = true
    if (e.detail.checked) {
      await window.connectors.users.assignApp(this.uid, this.app.package_name)
    } else {
      await window.connectors.users.unassignApp(this.uid, this.app.package_name)
    }
    this.loading = false
  }
  render() {
    return html`
      <ion-item>
        <ion-toggle ?checked=${this.assign} @ionChange=${this.handlerOnChange.bind(this)} ?disabled=${this.loading}>
          <ion-label>${this.app.title} (<ion-note color="medium">${this.app.package_name}</ion-note>)</ion-label>
          <ion-note color="medium">${this.app.description}</ion-note>
        </ion-toggle>
      </ion-item>
    `
  }
}

declare global {
  interface HTMLAppsUserItemElement {

  }
  interface HTMLElementTagNameMap {
    'apps-user-item': HTMLAppsUserItemElement
  }
}
