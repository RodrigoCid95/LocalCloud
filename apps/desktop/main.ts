import { setupNewNotificationSound } from './notification-sound'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration('./')
    .then(registration => registration?.unregister())
    .catch(reason => {
      console.error('No se pudo quitar el worker de notificaciones.', reason)
    })
}

setupNewNotificationSound()

import('./app').catch(reason => {
  console.error('No se pudo iniciar el escritorio.', reason)
})
