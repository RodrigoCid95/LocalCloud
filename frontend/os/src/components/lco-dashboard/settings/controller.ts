import type { Config } from '@ionic/core'

export default (el: HTMLElement) => {
  const selects = el.querySelectorAll('ion-select')
  const animatedRef = selects.item(0)
  const modeRef = selects.item(1)
  const backButtonTextRef = el.querySelector('ion-input')
  const buttonSaveRef = el.querySelectorAll('ion-button').item(1)
  const mode = window.Ionic.config.get('mode') || ''
  const backButtonText = window.Ionic.config.get('backButtonText') || ''
  const animated = window.Ionic.config.get('animated') || true
  animatedRef.value = !animated ? 'false' : ''
  backButtonTextRef.value = backButtonText
  modeRef.value = mode
  buttonSaveRef.addEventListener('click', async () => {
    const config: Partial<Config> = {}
    if (animatedRef.value) {
      config['animated'] = false
    }
    if (modeRef.value) {
      config['mode'] = modeRef.value
    }
    if (backButtonTextRef.value) {
      config['backButtonText'] = backButtonTextRef.value
    }
    await window.connectors.profile.setConfig({ ionic: config })
    window.location.reload()
  })
}