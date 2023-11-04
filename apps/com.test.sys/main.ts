import template from './template.html'

document.addEventListener("DOMContentLoaded", async () => {
  await window.loadCore()
  document.body.innerHTML = `<ion-app>${template}</ion-app>`
})