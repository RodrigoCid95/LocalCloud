import { Component, h, State, Event, EventEmitter } from '@stencil/core'

export interface Detail {
  ok: boolean
  message?: string
}

@Component({
  tag: 'lco-auth'
})
export class LCOAuth {
  @Event({ eventName: 'logged-in' }) logged: EventEmitter<Detail>
  @State() private userName: string = 'rcid'
  @State() private password: string = 'A.1b2c3d4'

  async _handlerOnEnter() {
    const data = {
      userName: this.userName,
      password: this.password
    }
    if (!Object.values(data).includes('')) {
      const laoding = await window.loadingController.create({ message: 'Inicaindo sesión ...' })
      await laoding.present()
      const response = await window.server.send<any, Detail>({
        method: 'post',
        endpoint: 'api/auth',
        data
      })
      await laoding.dismiss()
      this.logged.emit(response)
    }
  }

  render() {
    return (
      <ion-app>
        <ion-header>
          <ion-toolbar>
            <ion-title>Inicio de sesión</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen>
          <ion-grid>
            <ion-row>
              <ion-col size="12" offset-sm="3" size-sm="6" offset-lg="4" size-lg="4">
                <ion-list inset>
                  <ion-item>
                    <ion-input label="Nombre de usuario" label-placement="floating" value={this.userName} onIonInput={({ target }) => this.userName = target.value}></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-input label="Contraseña" label-placement="floating" type="password" value={this.password} onIonInput={({ target }) => this.password = target.value}></ion-input>
                  </ion-item>
                </ion-list>
                <div class="ion-padding">
                  <ion-button expand="block" class="ion-no-margin" onclick={this._handlerOnEnter.bind(this)}>Instalar</ion-button>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-app>
    )
  }
}