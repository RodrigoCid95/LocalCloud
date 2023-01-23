import _style from './style.scss'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'

@customElement('app-button')
export default class AppButton extends LitElement {
  static styles = [_style]
}