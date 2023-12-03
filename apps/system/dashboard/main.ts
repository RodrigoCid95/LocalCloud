import template from './template.html'

document.addEventListener('DOMContentLoaded', () => loadCore().then(() => {
  document.body.innerHTML = template
}))