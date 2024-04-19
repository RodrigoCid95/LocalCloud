import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { property } from 'lit/decorators/property.js'

@customElement('swap-item')
export default class SwapItem extends LitElement implements HTMLSwapItemElement {
  @state() private status: string = 'Preparando ...'
  @property({ type: Array }) path: string[] = []
  @property({ type: File }) file: File | undefined
  @property({ type: Boolean }) finished: boolean = true
  private fileTransfer: FileTransfer
  connectedCallback(): void {
    super.connectedCallback()
    if (this.file) {
      this.fileTransfer = window.server.createUploader({
        path: this.path,
        file: { name: this.file.name, file: this.file }
      })
    } else {
      this.fileTransfer = window.server.createDownloader(...this.path)
    }
    this.fileTransfer.on('end', () => {
      this.status = 'Completado.'
      this.finished = true
    })
    this.fileTransfer.on('error', () => {
      this.status = `Ocurrió un error al intentar ${this.file ? 'subir' : 'descargar'} el archivo.`
      this.finished = true
    })
    this.fileTransfer.on('abort', () => {
      this.status = `La ${this.file ? 'subida' : 'descarga'} fue cancelada.`
      this.finished = true
    })
    this.fileTransfer.start()
  }
  end() {
    if (this.finished) {
      this.dispatchEvent(new CustomEvent('remove'))
      this.remove()
    } else {
      this.fileTransfer.cancel()
    }
  }
  render() {
    return html`
      <ion-item>
        <ion-icon slot="start" name="cloud-${this.file ? 'upload' : 'download'}-outline"></ion-icon>
        <ion-label>
          ${this.file ? this.file.name : this.path[this.path.length - 1]}
          <p>${this.status}</p>
        </ion-label>
        <ion-button slot="end" fill="clear" @click=${this.end.bind(this)}>
          <ion-icon slot="icon-only" name="close"></ion-icon>
        </ion-button>
      </ion-item>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLSwapItemElement extends LitElement {
    path: string[]
    file: File | undefined
    finished: boolean
  }
  interface HTMLElementTagNameMap {
    'swap-item': HTMLSwapItemElement
  }
}