import { IController, WindowComponent } from 'builder'
import template from './template.html'

export default class AppTwo implements IController {
  static template = template
  static tag = 'page-one'
  element: HTMLElement
  onMount() {
    const parent = this.element.parentElement.parentElement as unknown as WindowComponent
    this.element.querySelector('[name="minimize"]').addEventListener('click', () => parent.minimize = true)
    this.element.querySelector('[name="close"]').addEventListener('click', () => parent.remove())
  }
}