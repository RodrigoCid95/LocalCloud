import { Component, h, Element, State } from '@stencil/core'
import Desktop from './desktop'

interface Status {
  WAIT: 'wait'
  AUTHENTICATED: 'authenticated'
  NOAUTHENTICATED: 'no-authenticated'
}

@Component({
  tag: 'lco-dashboard',
  styleUrl: './os.css'
})
export class AppDashboard {
  @Element() el: HTMLElement
  @State() status: keyof Status = 'WAIT'
  @State() apps: any[] = []

  componentDidRender() {
    document.addEventListener('onReady', async () => {
      const response = await window.server.send({
        method: 'get',
        endpoint: 'api/auth'
      })
      this.status = response === null ? 'NOAUTHENTICATED' : 'AUTHENTICATED'
    })
  }

  async componentDidUpdate() {
    const loginElement = this.el.querySelector('lco-auth')
    if (loginElement) {
      loginElement.addEventListener('logged-in', async (e: CustomEvent) => {
        if (e.detail.ok) {
          if ((new URLSearchParams(location.search)).has('dest')) {
            window.location.reload()
          } else {
            this.status = 'AUTHENTICATED'
          }
        } else {
          await (await window.alertController.create({
            header: 'Mensaje',
            message: e.detail.message,
            buttons: [
              {
                role: 'cancel',
                text: 'Aceptar'
              }
            ]
          })).present()
        }
      })
    } else {
      const loading = await window.loadingController.create({ message: 'Cargando...' })
      await loading.present()
      const { default: mod } = await import('./desktop/controller')
      await mod(this.el)
      await loading.dismiss()
      document.getElementById('create-app').addEventListener('click', () => {
        console.log('Create app!')
      })
    }
  }

  render() {
    if (this.status === 'AUTHENTICATED') {
      return <Desktop apps={this.apps} />
    }
    if (this.status === 'NOAUTHENTICATED') {
      return <lco-auth></lco-auth>
    }
    return <ion-progress-bar type="indeterminate"></ion-progress-bar>
  }
}
