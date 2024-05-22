import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'

@customElement('app-list')
export default class AppListElement extends LitElement implements HTMLAppListElement {
  @state() private apps: Apps.App[] = []
  connectedCallback(): void {
    super.connectedCallback()
    this.loadApps()
  }
  async loadApps(): Promise<void> {
    const loading = await window.loadingController.create({ message: 'Cargando lista de aplicaciones ...' })
    await loading.present()
    this.apps = await window.connectors.apps.list()
    await loading.dismiss()
  }
  uninstall(package_name: Apps.App['package_name']) {
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
            await window.connectors.apps.uninstall(package_name)
            await loading.dismiss()
            loadApps()
          }
        }
      ]
    }).then(alert => alert.present())
  }
  updateApp() {
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.multiple = false
    inputFile.accept = 'application/zip'
    inputFile.addEventListener('change', async () => {
      const file: File = inputFile.files?.item(0) as File
      const loading = await window.loadingController.create({ message: 'Comenzando Actualización ...' })
      await loading.present()
      const uploader = window.connectors.apps.install(file, true)
      uploader.on('end', ({ message }: any) => {
        loading
          .dismiss()
          .then(() => {
            if (message) {
              window.alertController
                .create({
                  header: 'La aplicación no se pudo instalar',
                  message,
                  buttons: ['Aceptar']
                })
                .then(alert => alert.present())
            } else {
              this.dispatchEvent(new CustomEvent('save'))
            }
          })
      })
      uploader.on('progress', (percent: number) => {
        loading.message = `Subiendo ${percent}%`
      })
      uploader.start()
    })
    inputFile.click()
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
                <ion-button class="ion-float-right" fill="outline" @click=${this.updateApp.bind(this)}>Actualizar</ion-button>
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