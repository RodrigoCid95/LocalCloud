import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

@customElement('apps-user')
export default class AppsUserElement extends LitElement implements HTMLAppsUserElement {
  @state() private apps: AppItem[] = []
  private modal = createRef<HTMLIonModalElement>()
  private name?: Users.User['name']
  async setUser(name: Users.User['name']): Promise<void> {
    this.apps = []
    const loading = await window.loadingController.create({ message: 'Cargando lista de apps ...' })
    await loading.present()
    this.name = name
    const userApps = await window.connectors.apps.listByUUID(name)
    this.apps = (await window.connectors.apps.list()).map(app => ({
      ...app,
      assign: userApps.findIndex(userApp => app.package_name === userApp.package_name) > -1
    }))
    await loading.dismiss()
    await this.modal.value?.present()
  }
  async changeAssign(package_name: Apps.App['package_name'], value: boolean) {
    const message = value ? 'Asignando ...' : 'Quitando asignación ...'
    const loading = await window.loadingController.create({ message })
    await loading.present()
    if (value) {
      await window.connectors.users.assignApp(this.name || '', package_name)
    } else {
      await window.connectors.users.unassignApp(this.name || '', package_name)
    }
    await loading.dismiss()
    this.setUser(this.name || '')
  }
  handlerOnDismiss() {
    this.name = undefined
    this.apps = []
  }
  render() {
    return html`
      <ion-modal ${ref(this.modal)} @ionModalWillDismiss=${this.handlerOnDismiss.bind(this)}>
        <ion-header>
          <ion-toolbar>
            <ion-title>Apps</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss()}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
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
            ${this.apps.map(app => html`
              <ion-item>
                <ion-toggle ?checked=${app.assign} @ionChange=${() => this.changeAssign(app.package_name, !app.assign)}>
                  <ion-label>${app.title}</ion-label>
                  <ion-note color="medium">${app.package_name}</ion-note>
                </ion-toggle>
              </ion-item>
            `)}
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
    setUser(name: Users.User['name']): void
  }
  interface HTMLElementTagNameMap {
    'apps-user': HTMLAppsUserElement
  }
}