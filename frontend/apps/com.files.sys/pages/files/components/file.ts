import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { property } from 'lit/decorators/property.js'

@customElement('file-item')
export default class FileItem extends LitElement {
  @property({ type: Array }) private path: string[]
  @property({ type: Object }) private file: FileInfo
  private slidingElement = createRef<HTMLIonItemSlidingElement>()
  connectedCallback(): void {
    super.connectedCallback()
    this.addEventListener('contextmenu', e => {
      e.preventDefault()
      this.slidingElement.value?.open('end')
    })
  }
  launch() {
    const path = [...this.path, this.file.name]
    const base: any = path.shift()
    window.server.launchFile(base, ...path)
  }
  async download() {
    await this.slidingElement.value?.close()
    document.querySelector('page-swaps')?.addItem([...this.path, this.file.name])
  }
  async delete() {
    await this.slidingElement.value?.close()
    const loading = await window.loadingController.create({ message: 'Eliminando archivo ...' })
    await loading.present()
    const path = [...this.path, this.file.name]
    const base = path.shift()
    await window.server.send({
      endpoint: `fs/${base}`,
      method: 'delete',
      data: JSON.stringify({ path: path.join('|') })
    })
    await loading.dismiss()
    this.remove()
  }
  async share() {
    await this.slidingElement.value?.close()
    const path = [...this.path, this.file.name]
    document.querySelector('page-shared')?.addItem(path)
  }
  render() {
    return html`
      <ion-item-sliding ${ref(this.slidingElement)}>
        <ion-item button @click=${this.launch.bind(this)}>
          <ion-icon slot="start" name="document-outline"></ion-icon>
          <ion-label>${this.file.name}<ion-label>
        </ion-item>
        <ion-item-options side="end">
          <ion-item-option color="success" @click=${this.share.bind(this)}>
            <ion-icon slot="icon-only" name="share-social-outline"></ion-icon>
          </ion-item-option>
          <ion-item-option @click=${this.download.bind(this)}>
            <ion-icon slot="icon-only" name="cloud-download-outline"></ion-icon>
          </ion-item-option>
          <ion-item-option color="danger" @click=${this.delete.bind(this)}>
            <ion-icon slot="icon-only" name="trash"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    `
  }
  createRenderRoot = () => this
}