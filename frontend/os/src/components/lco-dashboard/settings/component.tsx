import { h, Fragment } from '@stencil/core'

export default () => (
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
          <ion-select label="Animaciones" placeholder="Selecciona una opción" interface="popover" cancel-text="Cancelar">
            <ion-select-option aria-label="Habilitadas" value="">Habilitadas</ion-select-option>
            <ion-select-option aria-label="Deshabilitadas" value="false">Deshabilitadas</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select label="Diseño" placeholder="Selecciona una opción" interface="popover" cancel-text="Cancelar">
            <ion-select-option aria-label="Automático" value="">Automático</ion-select-option>
            <ion-select-option aria-label="IOS" value="ios">IOS</ion-select-option>
            <ion-select-option aria-label="Material Design" value="md">Material Design</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input label="Texto de botón atrás" label-placement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-button slot="end">Aplicar cambios</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </Fragment>
)