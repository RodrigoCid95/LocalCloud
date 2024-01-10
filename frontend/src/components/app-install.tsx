import { Component, h, State } from '@stencil/core'

@Component({
  tag: 'app-install'
})
export class AppRoot {
  @State() private fullName: string = 'Rodrigo Cid'
  @State() private userName: string = 'rcid'
  @State() private password: string = 'A.1b2c3d4'

  async _handlerOnSubmit() {
    const data = {
      fullName: this.fullName,
      userName: this.userName,
      password: this.password
    }
    if (!Object.values(data).includes('')) {
      await (await window.loadingController.create({ message: 'Instalando ...' })).present()
      await window.server.send({
        method: 'post',
        endpoint: 'api/install',
        data
      })
      window.location.reload()
    }
  }

  render() {
    return (
      <ion-app>
        <ion-header>
          <ion-toolbar>
            <ion-title>Instalación</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen>
          <ion-grid>
            <ion-row>
              <ion-col size="12" offset-sm="3" size-sm="6" offset-lg="4" size-lg="4">
                <ion-list inset>
                  <ion-item>
                    <ion-input label="Nombre completo" label-placement="floating" type="text" value={this.fullName} onIonInput={({ target }) => this.fullName = target.value}></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-input label="Nombre de usuario" label-placement="floating" type="text" value={this.userName} onIonInput={({ target }) => this.userName = target.value}></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-input label="Contraseña" label-placement="floating" type="password" value={this.password} onIonInput={({ target }) => this.password = target.value}></ion-input>
                  </ion-item>
                </ion-list>
                <div class="ion-padding">
                  <ion-button expand="block" class="ion-no-margin" onclick={this._handlerOnSubmit.bind(this)}>Instalar</ion-button>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-app>
    )
  }
}
