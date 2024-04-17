import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'

@customElement('app-list')
export default class AppListElement extends LitElement implements HTMLAppListElement {
  @state() private apps: App[] = []
  connectedCallback(): void {
    super.connectedCallback()
    this.loadApps()
  }
  async loadApps(): Promise<void> {
    const loading = await window.loadingController.create({ message: 'Cargando lista de aplicaciones ...' })
    await loading.present()
    this.apps = await window.server.send({
      endpoint: 'apps',
      method: 'get'
    })
    await loading.dismiss()
  }
  uninstall(package_name: App['package_name']) {
    const loadApps = this.loadApps.bind(this)
    window.alertController.create({
      header: 'Desinstalar app',
      message: '¿Estás seguro(a) que quieres desinstalar esta app?',
      buttons: [
        'No',
        {
          text: 'Si',
          cssClass: 'delete-button',
          async handler() {
            const loading = await window.loadingController.create({ message: 'Desinstalando ...' })
            await loading.present()
            await window.server.send({
              endpoint: `apps/${package_name}`,
              method: 'delete'
            })
            await loading.dismiss()
            loadApps()
          }
        }
      ]
    }).then(alert => alert.present())
  }
  render() {
    return html`
      <style>
        .delete-button {
          outline: 1px solid var(--ion-color-danger) !important;
          color: var(--ion-color-danger) !important;
        }

        app-list ion-card {
          position: relative;
        }

        app-list ion-card .btn-remove {
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      <ion-grid>
        <ion-row>
          ${this.apps.map(app => html`
            <ion-col
              size="12"
              size-sm="6"
              size-md="12"
              size-lg="6"
              size-xl="4"
            >
              <ion-card>
                <ion-card-header>
                  <ion-card-title>${app.title}&nbsp;<ion-note>(${app.package_name})</ion-note></ion-card-title>
                  <ion-card-subtitle>${app.author}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content><p>${app.description}</p></ion-card-content>
                <ion-button class="btn-remove" fill="clear" color="danger" @click=${() => this.uninstall(app.package_name)}>
                  <ion-icon slot="icon-only" name="remove-circle-outline"></ion-icon>
                </ion-button>
                <ion-button class="ion-float-right" fill="outline" @click=${() => this.dispatchEvent(new CustomEvent('permissions', { detail: app }))}>Permisos</ion-button>
                <ion-button class="ion-float-right" fill="outline" @click=${() => this.dispatchEvent(new CustomEvent('sources', { detail: app }))}>Fuentes</ion-button>
              </ion-card>
            </ion-col>
          `)}
        </ion-row>
      </ion-grid>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLAppListElement extends LitElement {
    loadApps(): Promise<void>
  }
  interface HTMLElementTagNameMap {
    'app-list': HTMLAppListElement
  }
}