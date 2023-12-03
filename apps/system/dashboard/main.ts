import template from './template.html'

document.addEventListener('DOMContentLoaded', () => loadCore().then(() => {
  document.body.innerHTML = template
  const config = JSON.parse(localStorage.getItem('ion-config') || '{}')
  const { mode = '', backButtonText = '', animated = true } = config
  const tabRef = document.querySelector<HTMLIonTabElement>('[tab="ionic"]') as HTMLIonTabElement
  const [animationsRef, designRef] = tabRef.querySelectorAll<HTMLIonSelectElement>('ion-select').values()
  const [backButtonTextRef] = tabRef.querySelectorAll<HTMLIonInputElement>('ion-input').values()
  const [saveButtonRef] = tabRef.querySelectorAll<HTMLIonButtonElement>('ion-button').values()
  animationsRef.value = animated ? '' : 'false'
  designRef.value = mode
  backButtonTextRef.value = backButtonText
  saveButtonRef.addEventListener('click', () => {
    const config: any = {}
    if (designRef.value) {
      config.mode = designRef.value
    }
    if (backButtonText.value) {
      config.backButtonText = backButtonText.value
    }
    if (animationsRef.value) {
      config.animated = animationsRef.value
    }
    localStorage.setItem('ion-config', JSON.stringify(config))
  })
}))