import { FilesController } from './view/controller'
import template from './template.html'

document.addEventListener("onReady", async () => {
  window.customElements.define('app-files', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = FilesController.template
      new FilesController(this)
    }
  })
  document.body.innerHTML = template
})