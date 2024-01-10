import type { Config } from '@ionic/core'
import { Component, h, Fragment, State } from '@stencil/core'

@Component({
  tag: 'app-menu-settings'
})
export class AppMenuSettings {
  @State() animated: string = ''
  @State() mode: string = ''
  @State() backButtonText: string = ''

  componentWillLoad() {
    const { mode = '', backButtonText = '', animated = true }: any = JSON.parse(localStorage.getItem('ion-config') || '{}')
    this.animated = animated ? '' : 'false'
    this.backButtonText = backButtonText
    this.mode = mode
  }

  _handlerOnSave() {
    const config: Partial<Config> = {}
    if (this.animated) {
      config['animated'] = false
    }
    if (this.mode) {
      config['mode'] = this.mode
    }
    if (this.backButtonText) {
      config['backButtonText'] = this.backButtonText
    }
    localStorage.setItem('ion-config', JSON.stringify(config))
    window.location.reload()
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar>
            <ion-title>Ajustes</ion-title>
            <ion-buttons slot="end">
              <ion-menu-toggle>
                <ion-button>
                  <ion-icon slot="icon-only" name="return-up-forward"></ion-icon>
                </ion-button>
              </ion-menu-toggle>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list inset>
            <ion-item>
              <ion-select label="Animaciones" placeholder="Selecciona una opción" interface="popover" cancel-text="Cancelar" value={this.animated} onIonChange={e => this.animated = e.detail.value}>
                <ion-select-option aria-label="Habilitadas" value="">Habilitadas</ion-select-option>
                <ion-select-option aria-label="Deshabilitadas" value="false">Deshabilitadas</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select label="Diseño" placeholder="Selecciona una opción" interface="popover" cancel-text="Cancelar" value={this.mode} onIonChange={e => this.mode = e.detail.value}>
                <ion-select-option aria-label="Automático" value="">Automático</ion-select-option>
                <ion-select-option aria-label="IOS" value="ios">IOS</ion-select-option>
                <ion-select-option aria-label="Material Design" value="md">Material Design</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-input label="Texto de botón atrás" label-placement="floating" value={this.backButtonText} onIonInput={e => this.backButtonText = e.target.value}></ion-input>
            </ion-item>
            <ion-item>
              <ion-button slot="end" onclick={this._handlerOnSave.bind(this)}>Aplicar cambios</ion-button>
            </ion-item>
          </ion-list>
        </ion-content>
      </Fragment>
    )
  }
}