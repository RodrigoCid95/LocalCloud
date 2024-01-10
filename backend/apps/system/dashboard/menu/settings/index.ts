import { AppSettingsController } from "./controller"

if (customElements.get('app-settings') === undefined) {
  customElements.define('app-settings', class AppSettings extends HTMLElement {
    constructor() {
      super()
      this.innerHTML = AppSettingsController.template
    }
    connectedCallback() {
      (new AppSettingsController()).onMount(this)
      this.style.display = 'contents'
    }
  })
}