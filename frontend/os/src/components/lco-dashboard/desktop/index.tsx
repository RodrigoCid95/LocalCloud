import { h } from '@stencil/core'
import Profile from './profile'
import Settings from './settings'

export default () => (
  <ion-app>
    <ion-content class="ion-padding">
      <ion-split-pane when="md" content-id="main-content">
        <ion-menu side="end" content-id="main-content">
          <ion-content class="ion-padding">
            <ion-tabs>
              <ion-tab tab="profile">
                <Profile />
              </ion-tab>
              <ion-tab tab="ionic">
                <Settings />
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
        <div class="ion-page" id="main-content">
          <ion-header>
            <ion-toolbar>
              <ion-title>Apps</ion-title>
              <ion-buttons slot="end">
                <ion-menu-button></ion-menu-button>
              </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar type="indeterminate"></ion-progress-bar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-grid>
              <ion-row id="app-list">
              </ion-row>
            </ion-grid>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
              <ion-fab-button>
                <ion-icon name="add"></ion-icon>
              </ion-fab-button>
              <ion-fab-list side="top">
                <ion-fab-button id="create-app">
                  <ion-icon name="code-slash"></ion-icon>
                </ion-fab-button>
                <ion-fab-button>
                  <ion-icon name="cloud-upload"></ion-icon>
                </ion-fab-button>
              </ion-fab-list>
            </ion-fab>
          </ion-content>
        </div>
      </ion-split-pane>
    </ion-content>
  </ion-app>
)