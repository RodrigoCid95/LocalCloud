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
    userName: HTMLIonTitleElement
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
    const [userNameRef, fullNameRef, emailRef, phoneRef, passwordRef] = this.createModal.querySelectorAll('ion-input').values()
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
    this.updateModal.querySelector('#update-user-cancel')?.addEventListener('click', () => this.updateModal.dismiss(false))
    this.updateModal.querySelector('#update-user-confirm')?.addEventListener('click', async () => {
      const loader = await window.loadingController.create({ message: 'Guardando...' })
      await loader.present()
      const uuid = this.updateFormRefs.uuid.value
      const full_name = this.updateFormRefs.fullName.value
      const email = this.updateFormRefs.email.value
      const phone = this.updateFormRefs.phone.value
      const data = JSON.stringify({ full_name, email, phone })
      await window.server.send({
        endpoint: `api/users/${uuid}`,
        method: 'put',
        data
      })
      await loader.dismiss()
      await this.updateModal.dismiss(true)
    })
    this.updateModal.addEventListener('ionModalDidDismiss', ({ detail }) => {
      if (detail.data) {
        this.#getUsers()
      }
    })
    const uuid = this.updateModal.querySelector('[name="uuid"]') as HTMLInputElement
    const [fullName, email, phone] = this.updateModal.querySelectorAll('ion-input').values() as unknown as HTMLIonInputElement[]
    const photo = this.updateModal.querySelector('ion-thumbnail img') as HTMLImageElement
    const userName = this.updateModal.querySelector('#update-user-title') as HTMLIonTitleElement
    this.updateFormRefs = { uuid, photo, userName, fullName, email, phone }
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
        this.updateFormRefs.userName.innerText = `Usuario - ${user.user_name}`
        this.updateFormRefs.fullName.value = user.full_name
        this.updateFormRefs.email.value = user.email
        this.updateFormRefs.phone.value = user.phone
        await this.updateModal.present()
      })
      item.innerHTML = `
        <ion-thumbnail slot="start">
          <img alt="${user.user_name}" src="" />
        </ion-thumbnail>
        <ion-label>
          ${user.full_name || ''}
          <br>
          <p>${user.user_name || ''}</p>
          ${this.#currentUser.uuid === user.uuid ? `<p>Usuario actual</p>` : ''}
        </ion-label>
      `
      col.append(item);
      (col.querySelector('img') as HTMLImageElement).src = user.photo || thumbnail
      cards.push(col)
    }
    for (const card of cards) {
      this.contentRef.append(card)
    }
    this.progressBarRef.style.display = 'none'
  }
}