import { ProgramManifest } from 'types'

export const manifest: ProgramManifest = {
  name: 'Iniciar sesión',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./app'),
  tag: 'app-desktop',
  type: 'program',
  services: []
}