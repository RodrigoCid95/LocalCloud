import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { property } from 'lit/decorators/property.js'

@customElement('file-item')
export default class FileItem extends LitElement {
  @property({ type: Array }) private path: string[]
  @property({ type: Object }) private file: FileInfo
  connectedCallback(): void {
    super.connectedCallback()
    this.addEventListener('contextmenu', e => {
      e.preventDefault()
      window.actionSheetController
        .create({
          header: this.file.name,
          buttons: [
            {
              text: 'Abrir',
              handler: this.launch.bind(this)
            },
            {
              text: 'Copiar',
              handler: () => this.dispatchEvent(new CustomEvent('copy', { detail: [...this.path, this.file.name] }))
            },
            {
              text: 'Cortar',
              handler: () => this.dispatchEvent(new CustomEvent('cut', { detail: [...this.path, this.file.name] }))
            },
            {
              text: 'Renombrar',
              handler: () => this.dispatchEvent(new CustomEvent('rename', { detail: [...this.path, this.file.name] }))
            },
            {
              text: 'Descargar',
              handler: this.download.bind(this)
            },
            {
              text: 'Compartir',
              handler: this.share.bind(this)
            },
            {
              text: 'Mover a la papelera',
              role: 'destructive',
              handler: this.delete.bind(this)
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]
        })
        .then(actionSheet => actionSheet.present())
    })
  }
  private formatSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + unidades[i]
  }
  private launch() {
    const path = [...this.path, this.file.name]
    const base: any = path.shift()
    window.server.launchFile(base, ...path)
  }
  private async download() {
    document.querySelector('page-swaps')?.addItem([...this.path, this.file.name])
  }
  private async delete() {
    const loading = await window.loadingController.create({ message: 'Eliminando archivo ...' })
    await loading.present()
    await document.querySelector('page-recycle-bin')?.add([...this.path, this.file.name])
    await loading.dismiss()
    this.remove()
    this.dispatchEvent(new CustomEvent('delete'))
  }
  private async share() {
    const path = [...this.path, this.file.name]
    document.querySelector('page-shared')?.addItem(path)
  }
  render() {
    return html`
      <ion-item button @click=${this.launch.bind(this)}>
        <ion-icon slot="start" name="document-outline"></ion-icon>
        <ion-label>
          ${this.file.name}
          <p>${this.formatSize(this.file.size)}</p>
        </ion-label>
      </ion-item>
    `
  }
  createRenderRoot = () => this
}