import { User } from 'interfaces/Users'
import template from './template.html'

export class AppProfileController {
  static template = template
  private uuid: string
  private photoRef: HTMLImageElement
  private userNameRef: HTMLIonInputElement
  private fullNameRef: HTMLIonInputElement
  private emailRef: HTMLIonInputElement
  private phoneRef: HTMLIonInputElement
  private progressBarRef: HTMLIonProgressBarElement
  private saveButtonRef: HTMLIonButtonElement
  async onMount(element: HTMLElement) {
    element.querySelector('[name="logout"]')?.addEventListener('click', async () => {
      await (await window.loadingController.create({ message: 'Cerrando sesión ...' })).present()
      await window.server.send({ method: 'delete', endpoint: 'api/auth' })
      localStorage.clear()
      window.location.reload()
    })
    this.progressBarRef = element.querySelector<HTMLIonProgressBarElement>('ion-progress-bar') as HTMLIonProgressBarElement
    const inputs = element.querySelectorAll<HTMLIonInputElement>('ion-input')
    this.userNameRef = inputs[0]
    this.fullNameRef = inputs[1]
    this.emailRef = inputs[2]
    this.phoneRef = inputs[3]
    this.photoRef = element.querySelector<HTMLImageElement>('ion-thumbnail > img') as HTMLImageElement
    const { uuid, userName, fullName, photo, email, phone } = await window.server.send<User>({
      method: 'get',
      endpoint: 'api/auth'
    })
    this.uuid = uuid
    if (photo) {
      this.photoRef.src = photo
    }
    this.userNameRef.value = userName
    this.fullNameRef.value = fullName
    this.emailRef.value = email
    this.phoneRef.value = phone
    this.progressBarRef.style.display = 'none'
    this.saveButtonRef = element.querySelector('[name="save"]') as HTMLIonButtonElement
    this.saveButtonRef.addEventListener('click', this.handlerOnSave.bind(this))
  }
  private async handlerOnSave() {
    const data = {
      fullName: this.fullNameRef.value || '',
      email: this.emailRef.value || '',
      phone: this.phoneRef.value || ''
    }
    if (!Object.values(data).includes('')) {
      this.saveButtonRef.disabled = true
      this.progressBarRef.style.display = 'block'
      await window.server.send({
        method: 'post',
        endpoint: 'api/profile',
        data
      })
      this.progressBarRef.style.display = 'none'
      this.saveButtonRef.disabled = false
    }
  }
}