import { FunctionalComponent, h } from '@stencil/core'

export const AppMenu: FunctionalComponent = () => (
  <ion-menu side="end" content-id="main-content">
    <ion-content class="ion-padding">
      <ion-tabs>
        <ion-tab tab="profile">
          <app-menu-profile></app-menu-profile>
        </ion-tab>
        <ion-tab tab="ionic">
          <app-menu-settings></app-menu-settings>
        </ion-tab>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="profile">
            <ion-icon name="person-circle-outline"></ion-icon>
            Perfil
          </ion-tab-button>
          <ion-tab-button tab="ionic">
            <ion-icon name="logo-ionic"></ion-icon>
            Interfaz
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-menu>
)