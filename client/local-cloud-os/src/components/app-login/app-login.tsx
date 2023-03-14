import { IonInput } from '@ionic/core/components/ion-input';
import { ICapacitor, LoadingController } from 'types/capacitor'
import { Component, h, Element } from '@stencil/core';

declare const loadingController: LoadingController
declare const Capacitor: ICapacitor

interface Credential {
  name: string
  password: string
}

@Component({
  tag: 'app-login',
})
export class AppLogin {
  @Element() el: HTMLElement
  componentDidLoad() {
    const modal = this.el.querySelector('ion-modal')
    modal.backdropDismiss = false
    const sendButton = this.el.querySelector('ion-button')
    sendButton.onclick = async () => {
      const userEl: IonInput = modal.querySelector('#username')
      const passEl: IonInput = modal.querySelector('#password')
      const name = userEl.value?.toString() || ''
      const password = passEl.value?.toString() || ''
      const credential: Credential = { name, password }
      const loading = await loadingController.create({
        message: 'Iniciando sesión ...'
      })
      await loading.present()
      const response = await Capacitor.Plugins.ServerConnector.emit<string>('auth signin', credential).catch(e => {
        console.log(e)
      })
      if (response === 'ok!') {
        modal.dismiss()
      }
      await loading.dismiss()
    }
    modal.present()
  }
  render() {
    return (
      <ion-modal>
        <ion-header>
          <ion-toolbar>
            <ion-title>Iniciar sesión</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="floating">Nombre de usuario:</ion-label>
            <ion-input id="username"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Contraseña:</ion-label>
            <ion-input id="password" type="password"></ion-input>
          </ion-item>
          <ion-button expand="full">Entrar</ion-button>
        </ion-content>
      </ion-modal>
    )
  }
}