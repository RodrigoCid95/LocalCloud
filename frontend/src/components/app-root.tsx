import { Component, h } from '@stencil/core'

@Component({
  tag: 'app-root'
})
export class AppRoot {
  private view = ''

  componentWillLoad() {
    this.view = document.body.classList.value
  }

  render() {
    switch (this.view) {
      case 'installation':
        return (
          <ion-app>
            <app-install></app-install>
          </ion-app>
        )
      case 'logged-in':
        return (
          <ion-app>
            <app-dashboard></app-dashboard>
          </ion-app>
        )
      case 'logged-out':
        return (
          <ion-app>
            <app-login></app-login>
          </ion-app>
        )
      default:
        return (
          <app-not-found></app-not-found>
        )
    }
  }
}
