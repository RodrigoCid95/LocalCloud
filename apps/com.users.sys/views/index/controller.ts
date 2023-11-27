import type { User } from "interfaces/Users"
import template from "./template.html"
import thumbnail from './thumbnail.svg'

import './components/new-user'
import './components/update-user'

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
    /* this.createModal = this.element.querySelector('#create-user-modal') as HTMLIonModalElement
    this.createModal.addEventListener('ionModalDidDismiss', this.#getUsers.bind(this))
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
    this.createModal.querySelector('#create-user-cancel')?.addEventListener('click', () => this.createModal.dismiss())
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
        const data = {
          userName: userNameRef.value,
          fullName: fullNameRef.value,
          email: emailRef.value,
          phone: phoneRef.value,
          password: passwordRef.value
        }
        await window.server.send('/users', { data, method: 'post' })
        await this.createModal.dismiss()
        window.server.send('/users', { data, method: 'post' })
          .then(() => this.createModal.dismiss())
          .catch(error => console.log(error))
      }
    })
    this.updateModal = this.element.querySelector('#update-user-modal') as HTMLIonModalElement
    this.updateModal.querySelector('#update-user-cancel')?.addEventListener('click', () => this.updateModal.dismiss())
    this.updateModal.querySelector('#update-user-confirm')?.addEventListener('click', async () => {
      const loader = await window.loadingController.create({ message: 'Guardando...' })
      await loader.present()
      const uuid = this.updateFormRefs.uuid.value
      const fullName = this.updateFormRefs.fullName.value
      const email = this.updateFormRefs.email.value
      const phone = this.updateFormRefs.phone.value
      const data = { fullName, email, phone }
      await window.server.send(`/users/${uuid}`, { data, method: 'put' })
      await loader.dismiss()
      await this.updateModal.dismiss()
    })
    this.updateModal.addEventListener('ionModalDidDismiss', this.#getUsers.bind(this))
    const uuid = this.updateModal.querySelector('[name="uuid"]') as HTMLInputElement
    const [fullName, email, phone] = this.updateModal.querySelectorAll('ion-input').values() as unknown as HTMLIonInputElement[]
    const photo = this.updateModal.querySelector('ion-thumbnail img') as HTMLImageElement
    const userName = this.updateModal.querySelector('#update-user-title') as HTMLIonTitleElement
    this.updateFormRefs = { uuid, photo, userName, fullName, email, phone } */
    this.#getUsers()
  }
  async #getUsers(): Promise<void> {
    this.contentRef.innerHTML = ''
    this.progressBarRef.style.display = 'block'
    this.#currentUser = (await window.server.send<User[]>('users?current', { method: 'get' }))[0]
    const results = await window.server.send<User[]>('users', { method: 'get' })
    const cards: HTMLIonColElement[] = []
    for (const user of results) {
      window[user.userName] = new URL(thumbnail)
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
        this.updateFormRefs.userName.innerText = `Usuario - ${user.userName}`
        this.updateFormRefs.fullName.value = user.fullName
        this.updateFormRefs.email.value = user.email
        this.updateFormRefs.phone.value = user.phone
        await this.updateModal.present()
      })
      item.innerHTML = `
        <ion-thumbnail slot="start">
          <img alt="${user.userName}" src="" />
        </ion-thumbnail>
        <ion-label>
          ${user.fullName || ''}
          <br>
          <p>${user.userName || ''}</p>
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