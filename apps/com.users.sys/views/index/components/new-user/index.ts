import template from './template.html'

export class NewUserController {
  static templete = template
  constructor(private element: HTMLElement) {

  }
}

if (customElements.get('new-user') === undefined) {
  customElements.define('new-user', class HTMLNewUserElement extends HTMLElement {
    connectedCallback() {
      this.innerHTML = NewUserController.templete
      new NewUserController(this)
    }
  })
}