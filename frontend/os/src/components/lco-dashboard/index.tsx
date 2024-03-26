import type { App } from './../../interfaces/Apps'
import { Component, h, Element, State } from '@stencil/core'
import Profile from './profile/component'
import Settings from './settings/component'
import ProfileController from './profile/controller'
import SettingsController from './settings/controller'

@Component({
  tag: 'lco-dashboard',
  styleUrl: './os.css'
})
export class AppDashboard {
  @Element() el: HTMLElement
  @State() apps: App[] | undefined = undefined
  componentDidLoad() {
    document.addEventListener('onReady', async () => {
      this.apps = await window.server.send({
        endpoint: 'api/profile/apps',
        method: 'get'
      })
      const tabs = this.el.querySelectorAll('ion-tab')
      ProfileController(tabs.item(0))
      SettingsController(tabs.item(1))
    })
  }
  private _handlerLaunchApp(packageName: string) {
    const url = `/app/${packageName}`
    console.log(url)
    window.open(url, null, 'popup,noopener,noopener')
  }
  render() {
    return (
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
                {this.apps === undefined && <ion-progress-bar type="indeterminate"></ion-progress-bar>}
              </ion-header>
              <ion-content class="ion-padding">
                <ion-grid>
                  <ion-row id="app-list">
                    {Array.isArray(this.apps) && !this.apps.length && (
                      <ion-col>
                        <ion-text color="dark" class="ion-text-center">
                          <h1>No hay apps...!</h1>
                        </ion-text>
                      </ion-col>
                    )}
                    {Array.isArray(this.apps) && this.apps.length > 0 && this.apps.map(app => (
                      <ion-col
                        size="12"
                        sizeSm="6"
                        sizeMd="12"
                        sizeLg="6"
                        sizeXl="4"
                      >
                        <ion-card>
                          <ion-card-header>
                            <ion-card-title>{app.title}</ion-card-title>
                            <ion-card-subtitle>{app.author}</ion-card-subtitle>
                          </ion-card-header>
                          <ion-card-content>
                            <p>{app.description}</p>
                          </ion-card-content>
                          <ion-button fill="clear" onClick={() => this._handlerLaunchApp(app.package_name)}>Iniciar</ion-button>
                        </ion-card>
                      </ion-col>
                    ))}
                  </ion-row>
                </ion-grid>
              </ion-content>
            </div>
          </ion-split-pane>
        </ion-content>
      </ion-app>
    )
  }
}
