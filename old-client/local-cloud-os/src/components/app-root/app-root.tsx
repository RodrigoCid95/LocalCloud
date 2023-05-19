import { Component, h, State } from '@stencil/core'
import { ICapacitor } from 'types/capacitor'

declare const Capacitor: ICapacitor

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {
  @State() private loading = true
  @State() private auth = false
  componentWillLoad() {
    Capacitor.Plugins.ServerConnector.onConnect(() => {
      this.loading = false
      Capacitor.Plugins.ServerConnector.on<boolean>('auth/change', auth => {
        this.auth = auth
      })
    })
  }
  render() {
    if (this.loading) {
      return <app-splash-screen />
    } else {
      if (this.auth) {
        return (
          <app-desktop />
        )
      } else {
        return <app-login />
      }
    }
  }
}