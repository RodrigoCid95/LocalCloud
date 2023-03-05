import { IController, WindowComponent } from 'builder'
import template from './template.html'

export default class PageTwo implements IController {
  static template = template
  static tag = 'page-two'
  element: HTMLElement
}