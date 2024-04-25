import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { property } from 'lit/decorators/property.js'

@customElement('folder-item')
export default class FolderItem extends LitElement {
  @property({ type: Array }) private path: string[]
  @property({ type: Object }) private folder: FileInfo
  connectedCallback(): void {
    super.connectedCallback()
    this.addEventListener('contextmenu', e => {
      e.preventDefault()
      window.actionSheetController
        .create({
          header: this.folder.name,
          buttons: [
            {
              text: 'Abrir',
              handler: this.launch.bind(this)
            },
            {
              text: 'Copiar',
              handler: () => this.dispatchEvent(new CustomEvent('copy', { detail: [...this.path, this.folder.name] }))
            },
            {
              text: 'Cortar',
              handler: () => this.dispatchEvent(new CustomEvent('cut', { detail: [...this.path, this.folder.name] }))
            },
            {
              text: 'Renombrar',
              handler: () => this.dispatchEvent(new CustomEvent('rename', { detail: [...this.path, this.folder.name] }))
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
  private launch() {
    this.dispatchEvent(new CustomEvent('go', { detail: [...this.path, this.folder.name] }))
  }
  private async delete() {
    const loading = await window.loadingController.create({ message: 'Eliminando carpeta ...' })
    await loading.present()
    await document.querySelector('page-recycle-bin')?.add([...this.path, this.folder.name])
    await loading.dismiss()
    this.remove()
    this.dispatchEvent(new CustomEvent('delete'))
  }
  render() {
    return html`
      <ion-item button @click=${this.launch.bind(this)}>
        <ion-icon slot="start" name="folder-outline"></ion-icon>
        <ion-label>${this.folder.name}</ion-label>
      </ion-item>
    `
  }
  createRenderRoot = () => this
}