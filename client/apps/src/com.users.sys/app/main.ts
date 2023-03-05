import { GetService, IController, WindowComponent } from 'builder'
import { IUsersService } from 'com.users.sys/types'
import template from './template.html'

export default class UsersApp implements IController{
  static template = template
  element: WindowComponent
  getService: GetService
  usersService: IUsersService
  async onMount() {
    this.usersService = this.getService<IUsersService>('users.service')
    console.log(this.usersService)
    this.element.querySelector('[name="minimize"]').addEventListener('click', () => this.element.minimize = true)
    this.element.querySelector('[name="close"]').addEventListener('click', () => this.element.remove())
    const progressarRef = this.element.querySelector('ion-progress-bar')
    progressarRef.style.display = 'block'
    await new Promise(resolve => setTimeout(resolve, 5000))
    progressarRef.style.display = 'none'
  }
}