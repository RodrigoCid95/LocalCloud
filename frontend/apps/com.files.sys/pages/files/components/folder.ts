import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { property } from 'lit/decorators/property.js'

@customElement('folder-item')
export default class FolderItem extends LitElement {
  @property({ type: Array }) private path: string[]
  @property({ type: Object }) private folder: FileInfo
  private slidingElement = createRef<HTMLIonItemSlidingElement>()
  connectedCallback(): void {
    super.connectedCallback()
    this.addEventListener('contextmenu', e => {
      e.preventDefault()
      this.slidingElement.value?.open('end')
    })
  }
  async delete() {
    await this.slidingElement.value?.close()
    const loading = await window.loadingController.create({ message: 'Eliminando carpeta ...' })
    await loading.present()
    const path = [...this.path, this.folder.name]
    const base = path.shift()
    await window.server.send({
      endpoint: `fs/${base}`,
      method: 'delete',
      data: JSON.stringify({ path: path.join('|') })
    })
    await loading.dismiss()
    this.remove()
  }
  render() {
    return html`
      <ion-item-sliding ${ref(this.slidingElement)}>
        <ion-item button @click=${() => this.dispatchEvent(new CustomEvent('go', { detail: [...this.path, this.folder.name] }))}>
          <ion-icon slot="start" name="folder-outline"></ion-icon>
          <ion-label>${this.folder.name}<ion-label>
        </ion-item>
        <ion-item-options side="end">
          <ion-item-option color="danger" @click=${this.delete.bind(this)}>
            <ion-icon slot="icon-only" name="trash"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    `
  }
  createRenderRoot = () => this
}