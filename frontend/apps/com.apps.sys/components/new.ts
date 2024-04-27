import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'

@customElement('new-app')
export default class NewAppElement extends LitElement implements HTMLNewAppElement {
  selectFile() {
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.multiple = false
    inputFile.accept = 'application/zip'
    inputFile.addEventListener('change', async () => {
      const file: File = inputFile.files?.item(0) as File
      const loading = await window.loadingController.create({ message: 'Comenzando instalación ...' })
      await loading.present()
      const uploader = window.connectors.apps.install(file)
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
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click=${this.selectFile.bind(this)}>
          <ion-icon name="bag-add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLNewAppElement extends LitElement { }
  interface HTMLElementTagNameMap {
    'new-app': HTMLNewAppElement
  }
}