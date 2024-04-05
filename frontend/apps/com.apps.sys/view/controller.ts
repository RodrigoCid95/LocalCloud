import template from './template.html'
import { PERMISSIONS_LIST } from './dictionary'

export class IndexController {
  static template = template
  #progressBarRef: HTMLIonProgressBarElement
  #appListRef: HTMLIonRowElement
  #permissionsListRef: HTMLIonListElement
  #permissionsModal: HTMLIonModalElement
  #sourcesModal: HTMLIonModalElement
  #sourcesListRef: HTMLIonListElement
  constructor(element: HTMLElement) {
    this.#progressBarRef = element.querySelector('#progress')
    this.#appListRef = element.querySelector('#app-list')
    this.#permissionsListRef = element.querySelector('#permissions-list')
    this.#permissionsModal = element.querySelector('#permissions-modal')
    this.#permissionsModal.querySelector('[name="close"]').parentElement.addEventListener('click', async () => {
      await this.#permissionsModal.dismiss()
      this.#loadApps()
    })
    this.#sourcesListRef = element.querySelector('#sources-list')
    this.#sourcesModal = element.querySelector('#sources-modal')
    this.#sourcesModal.querySelector('[name="close"]').parentElement.addEventListener('click', async () => {
      await this.#sourcesModal.dismiss()
      this.#loadApps()
    })
    element.querySelector('#refresh').addEventListener('click', this.#loadApps.bind(this))
    element.querySelector('#btn-install').addEventListener('click', () => {
      const inputElement = document.createElement('input')
      inputElement.type = 'file'
      inputElement.accept = 'application/zip'
      inputElement.addEventListener('change', async () => {
        const loading = await window.loadingController.create({ message: 'Instalando...' })
        const file = inputElement.files.item(0)
        const fileUploader = window.server.createUploader(
          'api/apps',
          { name: 'package_zip', file }
        )
        fileUploader.on('end', ({ message }) => {
          loading
            .dismiss()
            .then(() => {
              if (message) {
                window.alertController
                  .create({
                    header: 'La aplicación no se pudo instalar',
                    message,
                    buttons: ['Aceptar']
                  })
                  .then(alert => alert.present())
              } else {
                this.#loadApps()
              }
            })
        })
        fileUploader.on('progress', progress => {
          loading.message = `Instalando ${progress}%...`
        })
        fileUploader.start()
      })
      inputElement.click()
    })
    this.#loadApps()
  }
  async #loadApps(): Promise<void> {
    this.#progressBarRef.style.display = 'block'
    const apps: App[] = await window.server
      .send({
        endpoint: 'api/apps',
        method: 'get'
      })
      .then(response => response.json())
      .then((apps: App[]) => apps.filter(app => app.package_name !== 'com.apps.sys'))
    this.#appListRef.innerHTML = ''
    const _this = this
    for (const app of apps) {
      const appElement = document.createElement('ion-col')
      appElement.size = "12"
      appElement.sizeSm = "6"
      appElement.sizeMd = "12"
      appElement.sizeLg = "6"
      appElement.sizeXl = "4"
      const appCard = document.createElement('ion-card')
      appCard.innerHTML = `<ion-card-header><ion-card-title>${app.title}&nbsp;<ion-note>(${app.package_name})</ion-note></ion-card-title><ion-card-subtitle>${app.author}</ion-card-subtitle></ion-card-header><ion-card-content><p>${app.description}</p></ion-card-content>`
      appElement.append(appCard)
      const sourcesButton = document.createElement('ion-button')
      sourcesButton.classList.add('ion-float-right')
      sourcesButton.fill = 'outline'
      sourcesButton.innerHTML = 'Fuentes'
      sourcesButton.addEventListener('click', () => {
        const sourceElements: HTMLIonItemElement[] = []
        for (const source of app.secureSources) {
          const sourceItem = document.createElement('ion-item')
          const sourceToggle = document.createElement('ion-toggle')
          sourceToggle.checked = source.active
          sourceToggle.addEventListener('ionChange', async ({ detail: { checked } }) => {
            const loading = await window.loadingController.create({ message: checked ? 'Habilitando...' : 'Deshabilitando...' })
            await loading.present()
            await window.server.send({
              endpoint: `api/sources/${source.id}`,
              method: checked ? 'post' : 'delete'
            })
            await loading.dismiss()
          })
          const sourceLabel = document.createElement('ion-label')
          sourceLabel.classList.add('ion-text-wrap')
          sourceLabel.innerText = `(${source.type}) ${source.source}`
          const sourceJustifyNote = document.createElement('ion-note')
          sourceJustifyNote.classList.add('ion-text-wrap')
          sourceJustifyNote.innerText = source.justification
          sourceToggle.append(sourceLabel)
          sourceToggle.append(sourceJustifyNote)
          sourceItem.append(sourceToggle)
          sourceElements.push(sourceItem)
        }
        this.#sourcesListRef.innerHTML = ''
        if (sourceElements.length > 0) {
          for (const sourceElement of sourceElements) {
            this.#sourcesListRef.append(sourceElement)
          }
        } else {
          this.#sourcesListRef.innerHTML = '<ion-item><ion-label class="ion-text-center">No hay fuentes</ion-label></ion-item>'
        }
        this.#sourcesModal.present()
      })
      appCard.append(sourcesButton)
      const permissionsButton = document.createElement('ion-button')
      permissionsButton.classList.add('ion-float-right')
      permissionsButton.fill = 'outline'
      permissionsButton.innerHTML = 'Permisos'
      permissionsButton.addEventListener('click', () => {
        const permissionElements: HTMLIonItemElement[] = []
        for (const permission of app.permissions) {
          const permissionItem = document.createElement('ion-item')
          const permissionToggle = document.createElement('ion-toggle')
          permissionToggle.checked = permission.active
          permissionToggle.addEventListener('ionChange', async ({ detail: { checked } }) => {
            const loading = await window.loadingController.create({ message: checked ? 'Habilitando...' : 'Deshabilitando...' })
            await loading.present()
            await window.server.send({
              endpoint: `api/permissions/${permission.id}`,
              method: checked ? 'post' : 'delete'
            })
            await loading.dismiss()
          })
          const permissionLabel = document.createElement('ion-label')
          permissionLabel.classList.add('ion-text-wrap')
          permissionLabel.innerText = PERMISSIONS_LIST[permission.api]
          const permissionJustifyNote = document.createElement('ion-note')
          permissionJustifyNote.classList.add('ion-text-wrap')
          permissionJustifyNote.innerText = permission.justification
          permissionToggle.append(permissionLabel)
          permissionToggle.append(permissionJustifyNote)
          permissionItem.append(permissionToggle)
          permissionElements.push(permissionItem)
        }
        this.#permissionsListRef.innerHTML = ''
        if (permissionElements.length > 0) {
          for (const permissionElement of permissionElements) {
            this.#permissionsListRef.append(permissionElement)
          }
        } else {
          this.#permissionsListRef.innerHTML = '<ion-item><ion-label class="ion-text-center">No hay permisos</ion-label></ion-item>'
        }
        this.#permissionsModal.present()
      })
      appCard.append(permissionsButton)
      const uninstallButton = document.createElement('ion-button')
      uninstallButton.classList.add('btn-remove')
      uninstallButton.fill = 'clear'
      uninstallButton.color = 'danger'
      uninstallButton.innerHTML = '<ion-icon name="remove-circle-outline"></ion-icon>'
      uninstallButton.addEventListener('click', () => {
        window.alertController.create({
          header: 'Desinstalar app',
          message: '¿Estás seguro(a) que quieres desinstalar esta app?',
          buttons: [
            'Cancelar',
            {
              text: 'Aceptar',
              cssClass: 'delete-button',
              async handler() {
                const loading = await window.loadingController.create({ message: 'Desinstalando...' })
                await loading.present()
                await window.server.send({
                  endpoint: `api/apps/${app.package_name}`,
                  method: 'delete'
                })
                await loading.dismiss()
                _this.#loadApps()
              }
            }
          ]
        }).then(alert => alert.present())
      })
      appCard.append(uninstallButton)
      this.#appListRef.append(appElement)
    }
    this.#progressBarRef.style.display = 'none'
  }
}