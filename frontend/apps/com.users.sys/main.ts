import { IndexController } from "./views/index/controller"

document.addEventListener("DOMContentLoaded", async () => {
  await window.loadCore()
  window.customElements.define('app-page-index', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = IndexController.template
      new IndexController(this)
    }
  })
  document.body.innerHTML = '<ion-app><ion-nav root="app-page-index"></ion-nav></ion-app>'
})