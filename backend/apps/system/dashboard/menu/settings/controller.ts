import template from './template.html'

export class AppSettingsController {
  static template = template
  #config: Config
  constructor() {
    const { mode = '', backButtonText = '', animated = true } = JSON.parse(localStorage.getItem('ion-config') || '{}')
    this.#config = { mode, backButtonText, animated }
  }
  onMount(element: HTMLElement) {
    const [animationsRef, designRef] = element.querySelectorAll<HTMLIonSelectElement>('ion-select').values()
    const [backButtonTextRef] = element.querySelectorAll<HTMLIonInputElement>('ion-input').values()
    const [saveButtonRef] = element.querySelectorAll<HTMLIonButtonElement>('ion-button').values()
    animationsRef.value = this.#config.animated ? '' : 'false'
    designRef.value = this.#config.mode
    backButtonTextRef.value = this.#config.backButtonText
    saveButtonRef.addEventListener('click', () => {
      const config: Config = {}
      if (designRef.value) {
        config.mode = designRef.value
      }
      if (backButtonTextRef.value) {
        config.backButtonText = backButtonTextRef.value.toString()
      }
      if (animationsRef.value) {
        config.animated = animationsRef.value
      }
      localStorage.setItem('ion-config', JSON.stringify(config))
      window.location.reload()
    })
  }
}

interface Config {
  mode?: string
  backButtonText?: string
  animated?: boolean
}