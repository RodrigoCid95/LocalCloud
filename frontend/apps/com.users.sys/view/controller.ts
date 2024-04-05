import type { AlertInput } from "@ionic/core"
import template from "./template.html"
import thumbnail from './thumbnail.svg'

export class IndexController {
  static template = template
  progressBarRef: HTMLProgressElement
  contentRef: HTMLIonRowElement
  refreshButtonRef: HTMLIonButtonElement
  updateModal: HTMLIonModalElement
  createModal: HTMLIonModalElement
  #currentUser: User
  updateFormRefs: {
    uuid: HTMLInputElement
    photo: HTMLImageElement
    userName: HTMLIonInputElement
    fullName: HTMLIonInputElement
    email: HTMLIonInputElement
    phone: HTMLIonInputElement
  }
  constructor(private element: HTMLElement) {
    this.progressBarRef = this.element.querySelector('#progress') as HTMLProgressElement
    this.contentRef = this.element.querySelector('ion-row') as HTMLIonRowElement
    this.refreshButtonRef = this.element.querySelector('#refresh') as HTMLIonButtonElement
    this.refreshButtonRef.addEventListener('click', this.#getUsers.bind(this))
    this.createModal = this.element.querySelector('#create-user-modal') as HTMLIonModalElement
    this.createModal.addEventListener('ionModalDidDismiss', ({ detail }) => {
      if (detail.data) {
        this.#getUsers()
      }
    })
    const [userNameRef, fullNameRef, emailRef, phoneRef, passwordRef] = (this.createModal.querySelectorAll('ion-input') as any).values()
    const fields = [userNameRef, fullNameRef, emailRef, phoneRef, passwordRef]
    this.element.querySelector('#btn-new-user')?.addEventListener('click', async () => {
      for (const field of fields) {
        field.addEventListener('ionBlur', () => {
          field.classList.remove('ion-invalid')
          field.classList.remove('ion-touched')
        })
      }
      userNameRef.value = ''
      fullNameRef.value = ''
      emailRef.value = ''
      phoneRef.value = ''
      passwordRef.value = ''
      await this.createModal.present()
    })
    this.createModal.querySelector('#create-user-cancel')?.addEventListener('click', () => this.createModal.dismiss(false))
    this.createModal.querySelector('#create-user-confirm')?.addEventListener('click', async () => {
      let pass = true
      for (const field of fields) {
        if (field.value === '') {
          field.classList.add('ion-invalid')
          field.classList.add('ion-touched')
          pass = false
        }
      }
      if (pass) {
        const data = JSON.stringify({
          user_name: userNameRef.value,
          full_name: fullNameRef.value,
          email: emailRef.value,
          phone: phoneRef.value,
          password: passwordRef.value
        })
        const response = await window.server
          .send({
            endpoint: 'api/users',
            method: 'post',
            data: data
          })
          .then(response => response.json())
        if (response.code) {
          (await window.alertController.create({
            header: 'No se puede crear el usuario.',
            message: response.message,
            buttons: ['Aceptar']
          })).present()
          return
        }
        await this.createModal.dismiss(true)
      }
    })
    this.updateModal = this.element.querySelector('#update-user-modal') as HTMLIonModalElement
    this.updateModal.querySelector('#update-user-cancel')?.addEventListener('click', () => this.updateModal.dismiss())
    this.updateModal.querySelector('#update-user-confirm')?.addEventListener('click', async () => {
      const loader = await window.loadingController.create({ message: 'Guardando...' })
      await loader.present()
      const uuid = this.updateFormRefs.uuid.value
      let user_name: string | undefined = undefined
      if (this.updateFormRefs.userName.value !== this.updateFormRefs.userName.getAttribute('data-default')) {
        user_name = this.updateFormRefs.userName.value as string
      }
      const full_name = this.updateFormRefs.fullName.value
      const email = this.updateFormRefs.email.value
      const phone = this.updateFormRefs.phone.value
      const data = JSON.stringify({ user_name, full_name, email, phone })
      await window.server.send({
        endpoint: `api/users/${uuid}`,
        method: 'put',
        data
      })
      loader.dismiss()
    })
    this.updateModal.addEventListener('ionModalDidDismiss', this.#getUsers.bind(this))
    const uuid = this.updateModal.querySelector('[name="uuid"]') as HTMLInputElement
    const [userName, fullName, email, phone] = (this.updateModal.querySelectorAll('ion-input') as any).values() as unknown as HTMLIonInputElement[]
    const photo = this.updateModal.querySelector('ion-thumbnail img') as HTMLImageElement
    this.updateFormRefs = { uuid, photo, userName, fullName, email, phone }
    this.element.querySelector('#add-app').addEventListener('click', async () => {
      const loading = await window.loadingController.create({ message: 'Cargando...' })
      await loading.present()
      const userAppList: App[] = await window.server.send({
        endpoint: `api/apps/${this.updateFormRefs.uuid.value}`,
        method: 'get'
      }).then(response => response.json())
      const appList = await window.server
        .send({
          endpoint: 'api/apps',
          method: 'get'
        })
        .then(response => response.json())
        .then((appList: App[]) => appList.filter(app => userAppList.find(userApp => app.package_name === userApp.package_name) === undefined))
      if (appList.length > 0) {
        const inputs: AlertInput[] = []
        for (const app of appList) {
          inputs.push({
            type: 'checkbox',
            label: app.title,
            value: app.package_name
          })
        }
        const _this = this
        await window.alertController
          .create({
            header: 'Asignar apps',
            subHeader: 'Selecciona las apps que quieres asignar a este usuario.',
            inputs,
            buttons: [
              'Cancelar',
              {
                text: 'Asignar',
                async handler(package_names: string[]) {
                  const loading = await window.loadingController.create({ message: 'Asignando...' })
                  await loading.present()
                  for (const package_name of package_names) {
                    await window.server.send({
                      endpoint: 'api/users/assign-app',
                      method: 'post',
                      data: JSON.stringify({
                        uuid: _this.updateFormRefs.uuid.value,
                        package_name
                      })
                    })
                  }
                  await loading.dismiss()
                  _this.loadApps.bind(_this)()
                }
              }
            ]
          })
          .then(alert => alert.present())
      }
      await loading.dismiss()
      if (appList.length === 0) {
        await window.alertController
          .create({ header: 'Sin apps', message: 'Aún no hay apps instaladas.', buttons: ['Aceptar'] })
          .then(alert => alert.present())
      }
    })
    this.element.querySelector('#delete-user').addEventListener('click', () => {
      const _this = this
      window.alertController
        .create({
          header: 'Eliminar usuario',
          subHeader: '¿Estas seguro(a) que quieres eliminar este usuario?',
          message: 'Todos los datos de van a eliminar, incluyendo archivos, acceso al sistema y asignación de aplicaciones.',
          buttons: [
            'Cancelar',
            {
              role: 'cancel',
              text: 'Eliminar de todos modos',
              cssClass: 'delete-button',
              async handler() {
                const loading = await window.loadingController.create({ message: 'Eliminando...' })
                await loading.present()
                await window.server.send({
                  endpoint: `api/users/${_this.updateFormRefs.uuid.value}`,
                  method: 'delete'
                })
                await loading.dismiss()
                await _this.updateModal.dismiss()
              }
            }
          ]
        })
        .then(alert => alert.present())
    })
    this.#getUsers()
  }
  async #getUsers(): Promise<void> {
    this.contentRef.innerHTML = ''
    this.progressBarRef.style.display = 'block'
    this.#currentUser = await window.server
      .send({
        endpoint: 'api/profile',
        method: 'get'
      })
      .then(response => response.json())
    const results: User[] = await window.server
      .send({
        endpoint: 'api/users',
        method: 'get'
      })
      .then(response => response.json())
      .then((results: User[]) => results.filter(user => user.uuid !== this.#currentUser.uuid))
    const cards: HTMLIonColElement[] = []
    for (const user of results) {
      const col = document.createElement('ion-col')
      col.size = "12"
      col.sizeSm = "6"
      col.sizeMd = "4"
      col.sizeLg = "3"
      const item = document.createElement('ion-item')
      item.setAttribute("button", "true")
      item.addEventListener('click', async () => {
        this.updateFormRefs.uuid.value = user.uuid
        this.updateFormRefs.photo.src = user.photo || thumbnail
        this.updateFormRefs.userName.setAttribute('data-default', user.user_name)
        this.updateFormRefs.userName.value = user.user_name
        this.updateFormRefs.fullName.value = user.full_name
        this.updateFormRefs.email.value = user.email
        this.updateFormRefs.phone.value = user.phone
        await this.updateModal.present()
        this.loadApps()
      })
      item.innerHTML = `<ion-thumbnail slot="start"><img alt="${user.user_name}" src="" /></ion-thumbnail><ion-label>${user.full_name || ''}<br><p>${user.user_name || ''}</p>${this.#currentUser.uuid === user.uuid ? `<p>Usuario actual</p>` : ''}</ion-label>`
      col.append(item);
      (col.querySelector('img') as HTMLImageElement).src = user.photo || thumbnail
      cards.push(col)
    }
    for (const card of cards) {
      this.contentRef.append(card)
    }
    this.progressBarRef.style.display = 'none'
  }
  async loadApps() {
    const appListElement = this.element.querySelector('.app-list') as HTMLDivElement
    appListElement.innerHTML = '<ion-progress-bar type="indeterminate"></ion-progress-bar>'
    const results: App[] = await window.server.send({
      endpoint: `api/apps/${this.updateFormRefs.uuid.value}`,
      method: 'get'
    }).then(response => response.json())
    if (results.length > 0) {
      const appElements = []
      for (const app of results) {
        const appElement = document.createElement('ion-item')
        appElement.innerHTML = `<ion-label>${app.title}&nbsp;<ion-note slot="end">(${app.package_name})</ion-note></ion-label><ion-button slot="end" fill="clear"><ion-icon color="danger" name="remove-circle-outline"></ion-icon></ion-button>`
        appElement.querySelector('ion-button').addEventListener('click', async () => {
          appListElement.innerHTML = '<ion-progress-bar type="indeterminate"></ion-progress-bar>'
          await window.server.send({
            endpoint: 'api/users/unassign-app',
            method: 'post',
            data: JSON.stringify({
              uuid: this.updateFormRefs.uuid.value,
              package_name: app.package_name
            })
          })
          this.loadApps()
        })
        appElements.push(appElement)
      }
      appListElement.innerHTML = ''
      for (const app of appElements) {
        appListElement.append(app)
      }
    } else {
      appListElement.innerHTML = '<ion-item><ion-label class="ion-text-center">Sin apps!</ion-label></ion-item>'
    }
  }
}