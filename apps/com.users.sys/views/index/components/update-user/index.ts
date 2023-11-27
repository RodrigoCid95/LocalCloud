import template from './template.html'

export class UpdateUserController {
  static templete = template
  constructor(private element: HTMLElement) {

  }
}

if (customElements.get('update-user') === undefined) {
  customElements.define('update-user', class HTMLNewUserElement extends HTMLElement {
    connectedCallback() {
      this.innerHTML = UpdateUserController.templete
      new UpdateUserController(this)
    }
  })
}