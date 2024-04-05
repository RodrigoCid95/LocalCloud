import { IndexController } from "./view/controller"

document.addEventListener("onReady", async () => {
  window.customElements.define('app-page-index', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = IndexController.template
      new IndexController(this)
    }
  })
  document.body.innerHTML = '<app-page-index></app-page-index>'
})