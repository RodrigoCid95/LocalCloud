import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

@customElement('apps-user')
export default class AppsUserElement extends LitElement implements HTMLAppsUserElement {
  @state() private apps: AppItem[] = []
  private modal = createRef<HTMLIonModalElement>()
  private uuid?: User['uuid']
  async setUser(user: User): Promise<void> {
    const loading = await window.loadingController.create({ message: 'Cargando lista de apps ...' })
    await loading.present()
    this.uuid = user.uuid
    const userApps = await window.server.send<App[]>({
      endpoint: `apps/${user.uuid}`,
      method: 'get'
    })
    this.apps = (await window.server.send<AppItem[]>({
      endpoint: 'apps',
      method: 'get'
    })).map(app => ({
      ...app,
      assign: userApps.findIndex(userApp => app.package_name === userApp.package_name) > -1
    }))
    await loading.dismiss()
    await this.modal.value?.present()
  }
  async changeAssign(package_name: App['package_name'], value: boolean) {
    const message = value ? 'Asignando ...' : 'Quitando asignación ...'
    const loading = await window.loadingController.create({ message })
    await loading.present()
    await window.server.send({
      endpoint: `users/${value ? '' : 'un'}assign-app`,
      method: 'post',
      data: JSON.stringify({ uuid: this.uuid, package_name })
    })
    await loading.dismiss()
  }
  render() {
    return html`
      <ion-modal ${ref(this.modal)} @ionModalWillDismiss=${() => this.uuid = undefined}>
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

interface AppItem extends App {
  assign: boolean
}

declare global {
  interface HTMLAppsUserElement extends LitElement {
    setUser(user: User): void
  }
  interface HTMLElementTagNameMap {
    'apps-user': HTMLAppsUserElement
  }
}