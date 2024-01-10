import { Component, h } from '@stencil/core'

@Component({
  tag: 'app-not-found'
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-content>
          <h1>Página no econtrada!</h1>
        </ion-content>
      </ion-app>
    )
  }
}
