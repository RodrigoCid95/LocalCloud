import { AppManifest } from 'types'

export const manifest: AppManifest = {
  name: 'Iniciar sesión',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./app'),
  tag: 'app-login',
  type: 'app',
  services: ['com.login.service']
}