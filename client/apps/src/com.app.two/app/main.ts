import { AppArguments, WindowComponent } from 'builder'
import css from './style.scss'
import template from './template.html'

export default (kit: AppArguments) => {
  const { WindowComponent } = kit
  if (window.customElements.get('page-one') === undefined) {
    window.customElements.define('page-one', class PageOne extends HTMLElement {
      connectedCallback() {
        this.innerHTML = `
          <ion-header>
            <ion-toolbar>
              <ion-title>Page One</ion-title>
              <ion-buttons slot="end">
                <ion-button name="minimize">
                  <ion-icon slot="icon-only" name="remove-outline"></ion-icon>
                </ion-button>
                <ion-button name="close">
                  <ion-icon slot="icon-only" icon="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <h1>Page One</h1>
            <ion-nav-link router-direction="forward" component="page-two">
              <ion-button>Go to Page Two</ion-button>
            </ion-nav-link>
          </ion-content>
        `
        const parent = this.parentElement.parentElement as unknown as WindowComponent
        this.querySelector('[name="minimize"]').addEventListener('click', () => parent.minimize = true)
        this.querySelector('[name="close"]').addEventListener('click', () => parent.remove())
      }
    })
  }
  if (window.customElements.get('page-two') === undefined) {
    window.customElements.define('page-two', class PageTwo extends HTMLElement {
      connectedCallback() {
        this.innerHTML = `
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
              </ion-buttons>
              <ion-title>Page Two</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <h1>Page Two</h1>
            <div>
              <ion-nav-link router-direction="forward" component="page-three">
                <ion-button>Go to Page Three</ion-button>
              </ion-nav-link>
            </div>
          </ion-content>
        `;
      }
    })
  }
  if (window.customElements.get('page-three') === undefined) {
    window.customElements.define('page-three', class PageThree extends HTMLElement {
      connectedCallback() {
        this.innerHTML = `
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
              </ion-buttons>
              <ion-title>Page Three</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <h1>Page Three</h1>
          </ion-content>
        `;
      }
    })
  }
  return class AppTwoProgram extends WindowComponent {
    onMount() {
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.innerHTML = template
    }
  }
}