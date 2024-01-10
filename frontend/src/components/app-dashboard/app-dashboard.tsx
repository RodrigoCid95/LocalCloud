import { Component, h, Fragment } from '@stencil/core'
import { AppMenu } from './app-menu'

@Component({
  tag: 'app-dashboard',
  styleUrl: 'app-dashboard.css'
})
export class AppRoot {
  render() {
    return (
      <Fragment>
        <AppMenu />
        <ion-page id="main-content">
          <ion-header>
            <ion-toolbar>
              <ion-title>Apps</ion-title>
              <ion-buttons slot="end">
                <ion-menu-button></ion-menu-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">

          </ion-content>
        </ion-page>
      </Fragment>
    )
  }
}
