import { IonModal } from '@ionic/core/components/ion-modal'
import { IonInput } from '@ionic/core/components/ion-input'
import { IServer } from "builder"
import template from './template.html'

type Credential = {
  name: string
  password: string
}

export default (server: IServer) => {
  customElements.define('app-login', class PageOne extends HTMLElement {
    connectedCallback() {
      this.innerHTML = template
      const modal: IonModal = this.querySelector('ion-modal')
      modal.backdropDismiss = false
      const sendButton = this.querySelector('ion-button')
      sendButton.onclick = async () => {
        const userEl: IonInput = modal.querySelector('#username')
        const passEl: IonInput = modal.querySelector('#password')
        const name = userEl.value?.toString() || ''
        const password = passEl.value?.toString() || ''
        const credential: Credential = { name, password }
        const loading = await window.loadingController.create({
          message: 'Iniciando sesión ...'
        })
        await loading.present()
        const response = await server.emit<string>('auth signin', credential).catch(e => {
          console.log(e)
        })
        if (response === 'ok!') {
          modal.dismiss()
        }
        await loading.dismiss()
      }
      modal.present().then(() => sendButton.click())
    }
  })
}