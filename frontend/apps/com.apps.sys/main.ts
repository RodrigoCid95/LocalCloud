import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { createRef, ref } from 'lit/directives/ref.js'

import './components/list'
import './components/new'
import './components/permissions'
import './components/sources'

@customElement('app-root')
export default class AppAppsElement extends LitElement {
  private appListElement = createRef<HTMLAppListElement>()
  private appPermissions = createRef<HTMLAppPermissionsElement>()
  private appSources = createRef<HTMLAppSourcesElement>()
  render() {
    return html`
      <ion-app>
        <ion-header>
          <ion-toolbar>
            <ion-title>Apps</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.appListElement.value?.loadApps()}>
                <ion-icon slot="icon-only" name="refresh"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <app-list
            ${ref(this.appListElement)}
            @permissions=${(e: CustomEvent) => this.appPermissions.value?.open(e.detail.package_name)}
            @sources=${(e: CustomEvent) => this.appSources.value?.open(e.detail.package_name)}
          ></app-list>
          <app-permissions
            ${ref(this.appPermissions)}
          ></app-permissions>
          <app-sources
            ${ref(this.appSources)}
          ></app-sources>
          <new-app
            @save=${() => this.appListElement.value?.loadApps()}
          ></new-app>
        </ion-content>
      </ion-app>
    `
  }
  createRenderRoot = () => this
}

document.addEventListener("onReady", async () => {
  document.body.innerHTML = '<app-root></app-root>'
})