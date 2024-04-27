import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { property } from 'lit/decorators/property.js'
import { createRef, ref } from 'lit/directives/ref.js'

@customElement('shared-item')
export default class SharedItem extends LitElement {
  @property({ type: Object }) private shared: Shared.Shared
  private slidingElement = createRef<HTMLIonItemSlidingElement>()
  connectedCallback(): void {
    super.connectedCallback()
    this.addEventListener('contextmenu', e => {
      e.preventDefault()
      this.slidingElement.value?.open('end')
    })
  }
  async copy() {
    await this.slidingElement.value?.close()
    if ('clipboard' in navigator) {
      const url = window.createURL({
        path: ['shared', this.shared.id]
      }).href
      if (document.hasFocus()) {
        navigator.clipboard.writeText(url)
      }
    }
    const toast = await window.toastController.create({
      message: 'Copiado!',
      buttons: ['Aceptar'],
      duration: 1500
    })
    await toast.present()
  }
  async delete() {
    await this.slidingElement.value?.close()
    const loading = await window.loadingController.create({ message: 'Eliminando ...' })
    await loading.present()
    await window.connectors.shared.delete(this.shared.id)
    await loading.dismiss()
    this.dispatchEvent(new CustomEvent('delete'))
  }
  render() {
    return html`
      <ion-item-sliding ${ref(this.slidingElement)}>
        <ion-item>
          <ion-icon slot="start" name="share-social-outline"></ion-icon>
          <ion-label>${this.shared.path[this.shared.path.length - 1]}</ion-label>
        </ion-item>
        <ion-item-options slot="end">
          <ion-item-option @click=${this.copy.bind(this)}>
            <ion-icon slot="icon-only" name="clipboard-outline"></ion-icon>
          </ion-item-option>
          <ion-item-option color="danger" @click=${this.delete.bind(this)}>
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    `
  }
  createRenderRoot = () => this
}