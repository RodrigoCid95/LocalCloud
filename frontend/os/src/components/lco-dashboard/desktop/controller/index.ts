import ProfileController from './profile'
import SettingsController from './settings'

export default async (el: HTMLElement) => {
  const tabs = el.querySelectorAll('ion-tab')
  ProfileController(tabs.item(0))
  SettingsController(tabs.item(1))
  document.getElementById('main-content').querySelector('ion-progress-bar').style.display = 'none'
}