import { AppManifest } from 'types'

export const manifest: AppManifest = {
  title: 'Test Application One',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./app'),
  tag: 'app-one',
  type: 'app'
}