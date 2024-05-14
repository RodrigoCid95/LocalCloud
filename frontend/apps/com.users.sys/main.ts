import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { createRef, ref } from 'lit/directives/ref.js'

import './components/list'
import './components/new'
import './components/edit'
import './components/apps'

@customElement('app-root')
export default class AppRootElement extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `
  private userListElement = createRef<HTMLUserListElement>()
  private editUserElement = createRef<HTMLEditUserElement>()
  private appsUserElement = createRef<HTMLAppsUserElement>()
  render() {
    return html`
      <ion-app>
        <ion-header>
          <ion-toolbar>
            <ion-title>Usuarios</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.userListElement.value?.loadUsers()}>
                <ion-icon slot="icon-only" name="refresh"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <user-list
            ${ref(this.userListElement)}
            @edit=${(e: CustomEvent) => this.editUserElement.value?.setUser(e.detail)}
            @apps=${(e: CustomEvent) => this.appsUserElement.value?.setUser(e.detail.name)}
          ></user-list>
          <new-user
            @save=${() => this.userListElement.value?.loadUsers()}
          ></new-user>
          <edit-user
            ${ref(this.editUserElement)}
            @save=${() => this.userListElement.value?.loadUsers()}
          ></edit-user>
          <apps-user
            ${ref(this.appsUserElement)}
            @save=${() => this.userListElement.value?.loadUsers()}
          ></apps-user>
        </ion-content>
      </ion-app>
    `
  }
  createRenderRoot = () => this
}

document.addEventListener("onReady", async () => {
  document.body.innerHTML = '<app-root></app-root>'
})