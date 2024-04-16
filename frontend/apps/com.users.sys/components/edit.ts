import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'

@customElement('edit-user')
export default class EditUserElement extends LitElement implements HTMLEditUserElement {
  static styles = css`
    :host {
      display: contents;
    }
  `
  private modal = createRef<HTMLIonModalElement>()
  private uuid: string
  private userNameRef = createRef<HTMLIonInputElement>()
  private fullNameRef = createRef<HTMLIonInputElement>()
  private emailRef = createRef<HTMLIonInputElement>()
  private phoneRef = createRef<HTMLIonInputElement>()
  setUser(user: User): void {
    this.uuid = user.uuid;
    (this.userNameRef.value as HTMLIonInputElement).value = user.user_name;
    (this.fullNameRef.value as HTMLIonInputElement).value = user.full_name;
    (this.emailRef.value as HTMLIonInputElement).value = user.email;
    (this.phoneRef.value as HTMLIonInputElement).value = user.phone
    this.modal.value?.present()
  }
  private async save() {
    const user_name = this.userNameRef.value?.value?.toString().trim()
    const full_name = this.fullNameRef.value?.value?.toString().trim()
    const email = this.emailRef.value?.value?.toString().trim()
    const phone = this.phoneRef.value?.value?.toString().trim()
    if (!user_name) {
      this.userNameRef.value?.setAttribute('error-text', 'Campo requerido')
      this.userNameRef.value?.classList.add('ion-invalid')
      this.userNameRef.value?.setFocus()
      return
    }
    if (!full_name) {
      this.fullNameRef.value?.classList.add('ion-invalid')
      this.fullNameRef.value?.setFocus()
      return
    }
    const data = JSON.stringify({ user_name, full_name, email, phone })
    const loading = await window.loadingController.create({ message: 'Actualizando usuario ...' })
    await loading.present()
    const response = await window.server.send<any>({ endpoint: `users/${this.uuid}`, method: 'put', data })
    await loading.dismiss()
    if (response.code) {
      if (response.code === 'user-already-exists') {
        this.userNameRef.value?.setAttribute('error-text', 'Este usuario ya existe')
        this.userNameRef.value?.classList.add('ion-invalid')
        this.userNameRef.value?.setFocus()
        return
      }
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
    (this.userNameRef.value as HTMLIonInputElement).value = '';
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
            <ion-title>Editar usuario</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss().then(() => this.uuid = '')}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list inset>
            <ion-item>
              <ion-input
                ${ref(this.userNameRef)}
                class="ion-touched"
                label="Nombre de usuario"
                label-placement="floating"
                @ionBlur=${() => this.userNameRef.value?.classList.remove('ion-invalid')}
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                ${ref(this.fullNameRef)}
                class="ion-touched"
                label="Nombre completo"
                label-placement="floating"
                error-text="Campo requerido"
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
            <ion-button @click=${this.save.bind(this)} strong fill="clear" expand="full">Guardar</ion-button>
          </ion-list>
        </ion-content>
      </ion-modal>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLEditUserElement extends LitElement {
    setUser(user: User): void
  }
  interface HTMLElementTagNameMap {
    'edit-user': HTMLEditUserElement
  }
}