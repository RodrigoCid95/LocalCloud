import { ProgramManifest } from 'types'

export const manifest: ProgramManifest = {
  name: 'Barra de tareas',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./app'),
  tag: 'app-taskbar',
  type: 'program',
  services: []
}