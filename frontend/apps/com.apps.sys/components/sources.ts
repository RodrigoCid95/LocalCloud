import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

@customElement('app-sources')
export default class AppSourcesElement extends LitElement implements HTMLAppSourcesElement {
  @state() private secureSourceList: Sources.Source[] = []
  private modal = createRef<HTMLIonModalElement>()
  async open(package_name: Apps.App['package_name']): Promise<void> {
    const loading = await window.loadingController.create({ message: 'Cargando lista de fuentes seguras ...' })
    await loading.present()
    this.secureSourceList = await window.connectors.sources.find({ package_name })
    await loading.dismiss()
    await this.modal.value?.present()
  }
  async setSecure(id: Sources.Source['id'], active: Sources.Source['active']) {
    const loading = await window.loadingController.create({ message: active ? 'Habilitando fuente ...' : 'Deshabilitando fuente ...' })
    await loading.present()
    if (active) {
      await window.connectors.sources.enable(id)
    } else {
      await window.connectors.sources.disable(id)
    }
    await loading.dismiss()
  }
  render() {
    return html`
      <ion-modal ${ref(this.modal)}>
        <ion-header>
          <ion-toolbar>
            <ion-title>Fuentes seguras</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss()}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list inset>
            ${this.secureSourceList.length > 0 ? '' : html`
              <ion-item>
                <ion-label class="ion-text-center">No hay fuentes</ion-label>
              </ion-item>
            `}
            ${this.secureSourceList.map(source => html`
              <ion-item>
                <ion-toggle ?checked=${source.active} @ionChange=${() => this.setSecure(source.id, !source.active)}>
                  <ion-label>${source.source}</ion-label>
                  <ion-note color="medium">${source.type}</ion-note>
                </ion-toggle>
              </ion-item>
            `)}
          </ion-list>
        </ion-content>
      </ion-modal>
    `
  }
}

declare global {
  interface HTMLAppSourcesElement extends LitElement {
    open(package_name: Apps.App['package_name']): void
  }
  interface HTMLElementTagNameMap {
    'app-sources': HTMLAppSourcesElement
  }
}