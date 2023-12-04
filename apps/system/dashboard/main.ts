import template from './template.html'
import './menu'

document.addEventListener('DOMContentLoaded', () => loadCore().then(() => document.body.innerHTML = template))