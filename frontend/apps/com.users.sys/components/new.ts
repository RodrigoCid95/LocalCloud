import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'

@customElement('new-user')
export default class NewUserElement extends LitElement implements HTMLNewUserElement {
  static styles = css`
    :host {
      display: contents;
    }
  `
  private modal = createRef<HTMLIonModalElement>()
  private userNameRef = createRef<HTMLIonInputElement>()
  private fullNameRef = createRef<HTMLIonInputElement>()
  private emailRef = createRef<HTMLIonInputElement>()
  private phoneRef = createRef<HTMLIonInputElement>()
  private passwordRef = createRef<HTMLIonInputElement>()
  private async save() {
    const user_name = this.userNameRef.value?.value?.toString().trim()
    const full_name = this.fullNameRef.value?.value?.toString().trim()
    const email = this.emailRef.value?.value?.toString().trim() || ''
    const phone = this.phoneRef.value?.value?.toString().trim() || ''
    const password = this.passwordRef.value?.value?.toString().trim()
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
    if (!password) {
      this.passwordRef.value?.classList.add('ion-invalid')
      this.passwordRef.value?.setFocus()
      return
    }
    const data: Users.New = { name: user_name, full_name, email, phone, password }
    const loading = await window.loadingController.create({ message: 'Creando usuario ...' })
    await loading.present()
    const response = await window.connectors.users.create(data)
    await loading.dismiss()
    if (typeof response === 'object' && response.code) {
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
    (this.phoneRef.value as HTMLIonInputElement).value = '';
    (this.passwordRef.value as HTMLIonInputElement).value = '';
  }
  render() {
    return html`
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="light" @click=${() => this.modal.value?.present()}>
          <ion-icon name="person-add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-modal
        ${ref(this.modal)}
        @ionModalDidDismiss=${this.reset.bind(this)}
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Nuevo usuario</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss()}>
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
            <ion-item>
              <ion-input
                ${ref(this.passwordRef)}
                class="ion-touched"
                label="Contraseña"
                label-placement="floating"
                type="password"
                @ionBlur=${() => this.passwordRef.value?.classList.remove('ion-invalid')}
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
  interface HTMLNewUserElement extends LitElement { }
  interface HTMLElementTagNameMap {
    'new-user': HTMLNewUserElement
  }
}