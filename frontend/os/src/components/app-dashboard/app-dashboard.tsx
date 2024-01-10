import { Component, h, State, Fragment } from '@stencil/core'
import { AppMenu } from './app-menu'

@Component({
  tag: 'app-dashboard',
  styleUrl: 'app-dashboard.css'
})
export class AppRoot {
  @State() loading: boolean = true

  render() {
    return (
      <Fragment>
        <AppMenu />
        <ion-page id="main-content">
          <ion-header>
            <ion-toolbar>
              <ion-title>Inicio</ion-title>
              <ion-buttons slot="end">
                <ion-menu-button></ion-menu-button>
              </ion-buttons>
            </ion-toolbar>
            {this.loading && <ion-progress-bar type="indeterminate"></ion-progress-bar>}
          </ion-header>
          <ion-content class="ion-padding">
          </ion-content>
        </ion-page>
      </Fragment>
    )
  }
}
