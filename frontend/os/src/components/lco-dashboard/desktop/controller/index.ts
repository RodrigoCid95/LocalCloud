import ProfileController from './profile'
import SettingsController from './settings'

export default async (el: HTMLElement): Promise<void> => {
  const tabs = el.querySelectorAll('ion-tab')
  ProfileController(tabs.item(0))
  SettingsController(tabs.item(1))
  const response: any[] = await window.server.send({
    method: 'get',
    endpoint: 'api/user/apps'
  })
  if (Array.isArray(response)) {
    const _handlerOnClick = (packageName: string) => () => {
      console.log(`/app/${packageName}`)
      window.open(`/app/${packageName}`, null, 'popup,noopener,noopener')
    }
    for (const app of response) {
      const titleElement = document.createElement('ion-card-title')
      titleElement.innerText = app.title
      const subTitleElement = document.createElement('ion-card-subtitle')
      subTitleElement.innerText = app.author
      const headerElement = document.createElement('ion-card-header')
      headerElement.append(titleElement)
      headerElement.append(subTitleElement)
      const contentElement = document.createElement('ion-card-content')
      contentElement.innerText = app.description
      const buttonElement = document.createElement('ion-button')
      buttonElement.fill = 'clear'
      buttonElement.innerText = 'Iniciar'
      buttonElement.addEventListener('click', _handlerOnClick(app.packageName))
      const cardElement = document.createElement('ion-card')
      cardElement.append(headerElement)
      cardElement.append(contentElement)
      cardElement.append(buttonElement)
      const colElement = document.createElement('ion-col')
      colElement.size = '12'
      colElement.sizeSm = '6'
      colElement.sizeMd = '12'
      colElement.sizeLg = '6'
      colElement.sizeXl = '4'
      document.getElementById('app-list').append(cardElement)
    }
  }
  document.getElementById('main-content').querySelector('ion-progress-bar').style.display = 'none'
}