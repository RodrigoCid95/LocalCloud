import { ServiceManifest } from 'types'

export const manifest: ServiceManifest = {
  name: 'Servicio de prueba 1',
  icon: '',
  author: ['Rodrigo Cid'],
  callback: () => import('./service'),
  type: 'service'
}