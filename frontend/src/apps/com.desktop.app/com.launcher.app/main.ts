import { ProgramManifest } from 'types'

export const manifest: ProgramManifest = {
  name: 'Lanzador',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./app'),
  tag: 'app-launcher',
  type: 'program',
  services: []
}