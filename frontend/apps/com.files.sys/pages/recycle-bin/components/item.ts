import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { property } from 'lit/decorators/property.js'

@customElement('recycle-bin-item')
export class RecycleBinItemComponent extends LitElement implements HTMLRecycleBinItemElement {
  @property({ type: Object }) private item: RecycleBinItem | undefined
  constructor() {
    super()
    this.addEventListener('click', () => {
      if (this.item) {
        window.alertController
          .create({
            header: this.item.path[this.item.path.length - 1],
            message: `Fecha de eliminación: ${this.item.date}` + '\n' + `Ruta: ${this.item.path.join('/')}`,
            cssClass: ['rb-alert'],
            buttons: ['Aceptar']
          })
          .then(alert => alert.present())
      }
    })
    this.addEventListener('contextmenu', e => {
      e.preventDefault()
      if (this.item) {
        window.actionSheetController
          .create({
            header: this.item.path[this.item.path.length - 1],
            buttons: [
              {
                text: 'Restaurar',
                handler: this.restore.bind(this)
              },
              {
                text: 'Eliminar',
                role: 'destructive',
                handler: this.delete.bind(this)
              },
              {
                text: 'Cancelar',
                role: 'cancel'
              }
            ]
          })
          .then(aSheet => aSheet.present())
      }
    })
  }
  async restore(omitDispatchEvent?: boolean) {
    const id = this.item?.id
    this.item = undefined
    await window.server.send({
      endpoint: `recycle-bin/${id}`,
      method: 'put'
    })
    if (!omitDispatchEvent) {
      this.dispatchEvent(new CustomEvent('remove'))
    }
  }
  async delete(omitDispatchEvent?: boolean) {
    const id = this.item?.id
    this.item = undefined
    await window.server.send({
      endpoint: `recycle-bin/${id}`,
      method: 'delete'
    })
    if (!omitDispatchEvent) {
      this.dispatchEvent(new CustomEvent('remove'))
    }
  }
  render() {
    if (this.item) {
      return html`
        <ion-item button>
          <ion-label>
            ${this.item.path[this.item.path.length - 1]}
            <p>${this.item.date}</p>
          </ion-label>
        </ion-item>
      `
    } else {
      return html`
        <ion-item>
          <ion-progress-bar type="indeterminate"></ion-progress-bar>
        </ion-item>
      `
    }
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLRecycleBinItemElement extends LitElement {
    delete(omitDispatchEvent?: boolean): Promise<void>
    restore(omitDispatchEvent?: boolean): Promise<void>
  }
  interface HTMLElementTagNameMap {
    'recycle-bin-item': HTMLRecycleBinItemElement
  }
}