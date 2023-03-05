import { GetService, IController, WindowComponent } from 'builder'
import template from './template.html'

export default class AppOne implements IController {
  static template = template
  getService: GetService
  element: WindowComponent
  constructor(args: object) {
    console.log(this, args)
  }
  onMount() {
    this.element.querySelector('[name="minimize"]').addEventListener('click', () => this.element.minimize = true)
    this.element.querySelector('[name="close"]').addEventListener('click', () => this.element.remove())
  }
}