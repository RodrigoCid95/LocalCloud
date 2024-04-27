import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

@customElement('app-permissions')
export default class AppPermissionsElement extends LitElement implements HTMLAppPermissionsElement {
  @state() private permissionList: Permissions.Permission[] = []
  private modal = createRef<HTMLIonModalElement>()
  private PERMISSION_LIST: PermissionList = {
    'APP_LIST': 'Lista de aplicaciones instaladas.',
    'APP_LIST_BY_UUID': 'Lista de aplicaciones instaladas filtradas por usuario.',
    'INSTALL_APP': 'Instalar aplicaciones.',
    'UNINSTALL_APP': 'Desinstalar aplicaciones.',
    'ACCESS_SHARED_FILE_LIST': 'Acceso a lista de archivos en carpeta compartida.',
    'ACCESS_USER_FILE_LIST': 'Acceso a lista de archivos en carpeta del usuario.',
    'CREATE_SHARED_DIR': 'Crear directorios en carpeta compartida.',
    'CREATE_USER_DIR': 'Crear directorios en carpeta del usuario.',
    'UPLOAD_SHARED_FILE': 'Subir archivos en carpeta compartida.',
    'UPLOAD_USER_FILE': 'Subir archivos en carpeta del usuario.',
    'REMOVE_SHARED_FILES_AND_DIRECTORIES': 'Eliminar archivos y/o directorios en carpeta compartida.',
    'REMOVE_USER_FILES_AND_DIRECTORIES': 'Eliminar archivos y/o directorios en carpeta del usuario.',
    'ENABLE_PERMISSION': 'Habilitar permisos de aplicaciones.',
    'DISABLE_PERMISSION': 'Deshabilitar permisos de aplicaciones.',
    'PROFILE_INFO': 'Acceso a la información del perfil.',
    'PROFILE_APP_LIST': 'Lista de aplicaciones del asignadas al usuario.',
    'UPDATE_PROFILE_INFO': 'Actualizar información del perfil.',
    'UPDATE_PASSWORD': 'Actualizar la contraseña.',
    'ENABLE_SOURCE': 'Habilita una fuente de recursos.',
    'DISABLE_SOURCE': 'Deshabilita una fuente de recursos.',
    'USER_LIST': 'Lista de usuarios.',
    'USER_INFO': 'Información de un usuario.',
    'CREATE_USER': 'Crear usuarios',
    'UPDATE_USER_INFO': 'Actualizar la información de un usuario.',
    'DELETE_USER': 'Eliminar usuarios',
    'ASSIGN_APP_TO_USER': 'Asignar una aplicación a un usuario.',
    'UNASSIGN_APP_TO_USER': 'Quitar la asignación de una aplicación a un usuario.',
  }
  async open(package_name: Apps.App['package_name']): Promise<void> {
    const loading = await window.loadingController.create({ message: 'Cargando lista de permisos ...' })
    await loading.present()
    this.permissionList = await window.connectors.permissions.find({ package_name })
    await loading.dismiss()
    await this.modal.value?.present()
  }
  async setPermission(id: Permissions.Permission['id'], active: Permissions.Permission['active']) {
    const loading = await window.loadingController.create({ message: active ? 'Concediendo permiso ...' : 'Revocando permiso ...' })
    await loading.present()
    if (active) {
      await window.connectors.permissions.enable(id)
    } else {
      await window.connectors.permissions.disable(id)
    }
    await loading.dismiss()
  }
  render() {
    return html`
      <style>
        ion-note {
          display: block;
        }
      </style>
      <ion-modal ${ref(this.modal)}>
        <ion-header>
          <ion-toolbar>
            <ion-title>Permisos</ion-title>
            <ion-buttons slot="end">
              <ion-button @click=${() => this.modal.value?.dismiss()}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list inset>
            ${this.permissionList.length > 0 ? '' : html`
              <ion-item>
                <ion-label class="ion-text-center">No hay permisos</ion-label>
              </ion-item>
            `}
            ${this.permissionList.map(permission => html`
              <ion-item>
                <ion-toggle ?checked=${permission.active} @ionChange=${() => this.setPermission(permission.id, !permission.active)}>
                  <ion-label>${this.PERMISSION_LIST[permission.api] || permission.api}</ion-label>
                  <ion-note color="medium">${permission.justification}</ion-note>
                </ion-toggle>
              </ion-item>
            `)}
          </ion-list>
        </ion-content>
      </ion-modal>
    `
  }
  createRenderRoot = () => this
}

interface PermissionList {
  [api: string]: string
}

declare global {
  interface HTMLAppPermissionsElement extends LitElement {
    open(package_name: Apps.App['package_name']): void
  }
  interface HTMLElementTagNameMap {
    'app-permissions': HTMLAppPermissionsElement
  }
}