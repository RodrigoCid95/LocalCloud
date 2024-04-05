import { h, Fragment } from '@stencil/core'

export default () => (
  <Fragment>
    <ion-header>
      <ion-toolbar>
        <ion-title>Perfil</ion-title>
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
      <ion-progress-bar type="indeterminate"></ion-progress-bar>
      <ion-list inset>
        <ion-item>
          <ion-thumbnail>
            <img alt="Photo profile" src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
          </ion-thumbnail>
        </ion-item>
        <ion-item>
          <ion-input label="Nombre de usuario:" label-placement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Nombre completo:" label-placement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Correo electrónico:" label-placement="floating" type="email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Teléfono:" label-placement="floating" type="tel"></ion-input>
        </ion-item>
        <ion-item>
          <ion-button slot="end" name="save">Guardar</ion-button>
        </ion-item>
      </ion-list>
      <ion-list inset>
        <ion-item>
          <ion-input label="Contraseña actual:" label-placement="floating" type="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Nueva contraseña:" label-placement="floating" type="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Repite la contraseña:" label-placement="floating" type="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-button slot="end" name="save">Cambiar contraseña</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button name="logout">
            <ion-icon slot="icon-only" name="log-out"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </Fragment>
)