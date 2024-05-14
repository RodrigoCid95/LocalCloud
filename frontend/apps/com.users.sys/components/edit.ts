import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { state } from 'lit/decorators/state.js'
import { ref, createRef } from 'lit/directives/ref.js'

@customElement('edit-user')
export default class EditUserElement extends LitElement implements HTMLEditUserElement {
  static styles = css`
    :host {
      display: contents;
    }
  `
  @state() private name: string = ''
  private modal = createRef<HTMLIonModalElement>()
  private fullNameRef = createRef<HTMLIonInputElement>()
  private emailRef = createRef<HTMLIonInputElement>()
  private phoneRef = createRef<HTMLIonInputElement>()
  private uid: number = NaN
  setUser(user: Users.User): void {
    this.uid = user.uid
    this.name = user.name;
    (this.fullNameRef.value as HTMLIonInputElement).value = user.full_name;
    (this.emailRef.value as HTMLIonInputElement).value = user.email;
    (this.phoneRef.value as HTMLIonInputElement).value = user.phone
    this.modal.value?.present()
  }
  private async save() {
    const full_name = this.fullNameRef.value?.value?.toString().trim()
    const email = this.emailRef.value?.value?.toString().trim()
    const phone = this.phoneRef.value?.value?.toString().trim()
    if (!full_name) {
      this.fullNameRef.value?.classList.add('ion-invalid')
      this.fullNameRef.value?.setFocus()
      return
    }
    const data = { full_name, email, phone }
    const loading = await window.loadingController.create({ message: 'Actualizando usuario ...' })
    await loading.present()
    const response = await window.connectors.users.update(this.uid, data)
    await loading.dismiss()
    if (typeof response === 'object' && response.code) {
      (await window.alertController.create({
        header: 'No se puede crear el usuario.',
        message: response.message,
        buttons: ['Aceptar']
      })).present()
      return
    }
    this.modal.value?.dismiss()
    this.dispatchEvent(new CustomEvent('save'))
  }
  reset() {
    this.uid = NaN
    this.name = '';
    (this.fullNameRef.value as HTMLIonInputElement).value = '';
    (this.emailRef.value as HTMLIonInputElement).value = '';
    (this.phoneRef.value as HTMLIonInputElement).value = ''
    this.dispatchEvent(new CustomEvent('close'))
  }
  render() {
    return html`
      <ion-modal
        ${ref(this.modal)}
        @ionModalDidDismiss=${this.reset.bind(this)}
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Editar usuario - ${this.name}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss().then(() => this.uid = NaN)}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list inset>
            <ion-item>
              <ion-input
                ${ref(this.fullNameRef)}
                class="ion-touched"
                label="Nombre completo"
                label-placement="floating"
                @ionBlur=${() => this.fullNameRef.value?.classList.remove('ion-invalid')}
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                ${ref(this.emailRef)}
                label="Correo electrónico"
                label-placement="floating"
                type="email"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                ${ref(this.phoneRef)}
                label="Teléfono"
                label-placement="floating"
                type="tel"
              ></ion-input>
            </ion-item>
            <ion-button @click=${this.save.bind(this)} color="dark" strong fill="clear" expand="full">Guardar</ion-button>
          </ion-list>
        </ion-content>
      </ion-modal>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLEditUserElement extends LitElement {
    setUser(user: Users.User): void
  }
  interface HTMLElementTagNameMap {
    'edit-user': HTMLEditUserElement
  }
}