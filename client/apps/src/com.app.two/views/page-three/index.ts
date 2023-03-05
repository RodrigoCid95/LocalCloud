import { IController } from 'builder'
import template from './template.html'

export default class PageThree implements IController {
  static template = template
  static tag = 'page-three'
  element: HTMLElement
}