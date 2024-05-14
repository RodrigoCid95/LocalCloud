import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('user-list')
export default class UserListElement extends LitElement implements HTMLUserListElement {
  @state() private userList: Users.User[] = []
  connectedCallback(): void {
    super.connectedCallback()
    this.loadUsers()
  }
  public async loadUsers() {
    const loading = await window.loadingController.create({ message: 'Cargando ...' })
    await loading.present()
    this.userList = []
    const currentUser = await window.connectors.profile.info()
    const list = await window.connectors.users.list()
    this.userList = list.filter(item => item.id !== currentUser.id)
    await loading.dismiss()
  }
  private delete(name: Users.User['name']) {
    const loadUsers = this.loadUsers.bind(this)
    window.alertController
      .create({
        header: 'Eliminar usuario',
        subHeader: '¿Estas seguro(a) que quieres eliminar este usuario?',
        message: 'Todos los datos de van a eliminar, incluyendo archivos, acceso al sistema y asignación de aplicaciones.',
        buttons: [
          'No',
          {
            role: 'cancel',
            text: 'Si',
            cssClass: 'delete-button',
            async handler() {
              const loading = await window.loadingController.create({ message: 'Eliminando ...' })
              await loading.present()
              await window.connectors.users.delete(name)
              await loading.dismiss()
              await loadUsers()
            }
          }
        ]
      })
      .then(alert => alert.present())
  }
  render() {
    return html`
      <style>
        .user-item {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
        }
        .user-item .buttons {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          position: absolute;
        }
        .delete-button {
          outline: 1px solid var(--ion-color-danger) !important;
          color: var(--ion-color-danger) !important;
        }
      </style>
      <ion-grid>
        <ion-row>
          ${this.userList.map(user => html`
            <ion-col
              size="12"
              size-sm="6"
              size-md="4"
              size-lg="3"
            >
              <ion-card class="user-item">
                <ion-card-header>
                  <ion-card-title>${user.name}</ion-card-title>
                  <ion-card-subtitle>${user.full_name}</ion-card-subtitle>
                </ion-card-header>
                <div class="buttons">
                  <ion-button fill="clear" @click=${() => this.dispatchEvent(new CustomEvent('apps', { detail: user }))}>
                    <ion-icon slot="icon-only" name="apps-outline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" @click=${() => this.dispatchEvent(new CustomEvent('edit', { detail: user }))}>
                    <ion-icon slot="icon-only" name="create-outline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click=${() => this.delete(user.name)}>
                    <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                  </ion-button>
                </div>
              </ion-card>
            </ion-col>
          `)}
        </ion-row>
      </ion-grid>
    `
  }
  createRenderRoot = () => this
}

declare global {
  interface HTMLUserListElement extends LitElement {
    loadUsers(): Promise<void>
  }
  interface HTMLElementTagNameMap {
    'user-list': HTMLUserListElement
  }
}