import template from './template.html'
import './profile'
import './settings'

if (customElements.get('app-menu') === undefined) {
  customElements.define('app-menu', class AppMenu extends HTMLElement {
    constructor() {
      super()
      this.innerHTML = template
      this.style.display = 'contents'
    }
  })
}