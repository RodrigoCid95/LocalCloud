import { AppManifest } from 'types'

export const manifest: AppManifest = {
  title: 'Test Application Two',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./app'),
  tag: 'app-two',
  type: 'app'
}