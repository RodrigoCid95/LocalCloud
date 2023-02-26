import Service from 'kernel/lib/Service'
import { LauncherService, Manifests } from '../types'

export default (ClassService: typeof Service) => {
  return class Service1 extends ClassService implements LauncherService {
    getAppList() {
      return this.server.emit<Manifests>('apps-manager user/manifests', {})
    }
  }
}