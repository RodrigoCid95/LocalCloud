import { Component, h, Fragment, State } from '@stencil/core'
import type { User } from './../../../interfaces/Users'

@Component({
  tag: 'app-menu-profile'
})
export class AppMenuProfile {
  @State() loading: boolean = true
  @State() uuid: string = ''
  @State() photo: string = ''
  @State() userName: string = ''
  @State() fullName: string = ''
  @State() email: string = ''
  @State() phone: string = ''

  async componentWillLoad() {
    const { uuid, userName, fullName, photo, email, phone } = await window.server.send<User>({
      method: 'get',
      endpoint: 'api/auth'
    })
    this.uuid = uuid
    if (photo) {
      this.photo = photo
    }
    this.userName = userName
    this.fullName = fullName
    this.email = email
    this.phone = phone
    this.loading = false
  }

  async logout() {
    await (await window.loadingController.create({ message: 'Cerrando sesión ...' })).present()
    await window.server.send({ method: 'delete', endpoint: 'api/auth' })
    localStorage.clear()
    window.location.reload()
  }

  async _handlerOnSave() {
    const data = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone
    }
    if (!Object.values(data).includes('')) {
      this.loading = true
      await window.server.send({
        method: 'post',
        endpoint: 'api/profile',
        data
      })
      this.loading = false
    }
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar>
            <ion-title>Perfíl</ion-title>
            <ion-buttons slot="end">
              <ion-menu-toggle>
                <ion-button>
                  <ion-icon slot="icon-only" name="return-up-forward"></ion-icon>
                </ion-button>
              </ion-menu-toggle>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          {this.loading && <ion-progress-bar type="indeterminate"></ion-progress-bar>}
          <ion-list inset>
            <ion-item>
              <ion-thumbnail>
                <img alt="Photo profile" src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
              </ion-thumbnail>
            </ion-item>
            <ion-item>
              <ion-input label="Nombre de usuario:" label-placement="floating" disabled value={this.userName}></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Nombre completo:" label-placement="floating" value={this.fullName} onIonInput={({ target }) => this.fullName = target.value}></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Correo electrónico:" label-placement="floating" type="email" value={this.email} onIonInput={({ target }) => this.email = target.value}></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Teléfono:" label-placement="floating" type="tel" value={this.phone} onIonInput={({ target }) => this.phone = target.value}></ion-input>
            </ion-item>
            <ion-item>
              <ion-button slot="end" name="save" onclick={this._handlerOnSave.bind(this)}>Guardar</ion-button>
            </ion-item>
          </ion-list>
        </ion-content>
        <ion-footer>
          <ion-toolbar>
            <ion-buttons slot="end">
              <ion-button name="logout" onclick={this.logout.bind(this)}>
                <ion-icon slot="icon-only" name="log-out"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-footer>
      </Fragment>
    )
  }
}