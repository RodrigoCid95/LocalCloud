import { AppProfileController } from "./controller"

if (customElements.get('app-profile') === undefined) {
  customElements.define('app-profile', class AppProfile extends HTMLElement {
    constructor() {
      super()
      this.innerHTML = AppProfileController.template
    }
    connectedCallback() {
      (new AppProfileController()).onMount(this)
      this.style.display = 'contents'
    }
  })
}